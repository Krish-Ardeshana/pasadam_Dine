import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, UserDocument } from '../../database/schemas/index.js';
import { Role, UserStatus } from '../../common/enums/index.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ChangePasswordDto } from './dto/refresh-token.dto.js';
import { AuditService } from '../audit/audit.service.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  async register(registerDto: RegisterDto) {
    const email = registerDto.email.toLowerCase().trim();

    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    // Role safety check: cannot self-register as SUPER_ADMIN
    let assignedRole = registerDto.role || Role.RESTAURANT_OWNER;
    if (assignedRole === Role.SUPER_ADMIN) {
      assignedRole = Role.RESTAURANT_OWNER;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    const user = await this.userModel.create({
      name: registerDto.name.trim(),
      email,
      passwordHash,
      role: assignedRole,
      restaurantAssignments: [],
      permissions: [],
      accountStatus: UserStatus.ACTIVE,
    });

    const tokens = await this.generateTokens(user._id.toString(), user.email, user.role);
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    await this.auditService.log({
      actorId: user._id,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user._id.toString(),
      safeMetadata: { email: user.email, role: user.role },
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantAssignments: user.restaurantAssignments,
        accountStatus: user.accountStatus,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const email = loginDto.email.toLowerCase().trim();
    const user = await this.userModel
      .findOne({ email })
      .select('+passwordHash +refreshTokenHash')
      .exec();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.accountStatus !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active or has been suspended');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user._id.toString(), user.email, user.role);
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    await this.auditService.log({
      actorId: user._id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user._id.toString(),
      safeMetadata: { email: user.email },
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantAssignments: user.restaurantAssignments,
        accountStatus: user.accountStatus,
      },
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
      const payload = this.jwtService.verify(refreshToken, { secret: refreshSecret });

      const user = await this.userModel
        .findById(payload.sub)
        .select('+refreshTokenHash')
        .exec();

      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Invalid or revoked refresh token');
      }

      const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid or revoked refresh token');
      }

      const tokens = await this.generateTokens(user._id.toString(), user.email, user.role);
      await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: null }).exec();
    return { success: true, message: 'Logged out successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('restaurantAssignments', 'name slug logoUrl approvalStatus isActive')
      .exec();

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return user;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId).select('+passwordHash').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Current password does not match');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(dto.newPassword, salt);
    await user.save();

    return { success: true, message: 'Password updated successfully' };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const jwtSecret = this.configService.get<string>('jwt.secret');
    const expiresIn = this.configService.get<string>('jwt.expiresIn') || '1d';
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
    const refreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn') || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: expiresIn as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn,
    };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(refreshToken, salt);
    await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: hash }).exec();
  }
}
