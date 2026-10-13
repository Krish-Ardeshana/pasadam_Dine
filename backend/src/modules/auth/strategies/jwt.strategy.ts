import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../../database/schemas/index.js';
import { UserStatus } from '../../../common/enums/index.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {
    const jwtSecret = configService.get<string>('jwt.secret') || 'default_secret';
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userModel.findById(payload.sub).exec();

    if (!user) {
      throw new UnauthorizedException('User account no longer exists');
    }

    if (user.accountStatus !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User account is suspended or pending verification');
    }

    return {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      restaurantAssignments: (user.restaurantAssignments || []).map((id) => id.toString()),
      permissions: user.permissions || [],
    };
  }
}
