import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, UserDocument } from '../../database/schemas/index.js';
import { Role, UserStatus } from '../../common/enums/index.js';

@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    await this.provisionSuperAdmin();
  }

  async provisionSuperAdmin() {
    try {
      const email = this.configService.get<string>('superAdmin.email');
      const password = this.configService.get<string>('superAdmin.password');
      const name = this.configService.get<string>('superAdmin.name');

      if (!email || !password) {
        this.logger.warn('SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set. Skipping bootstrap.');
        return;
      }

      const existingAdmin = await this.userModel.findOne({ email }).exec();
      if (!existingAdmin) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await this.userModel.create({
          name: name || 'Platform Administrator',
          email,
          passwordHash,
          role: Role.SUPER_ADMIN,
          restaurantAssignments: [],
          permissions: ['*'],
          accountStatus: UserStatus.ACTIVE,
        });

        this.logger.log(`Super Admin user initialized successfully: ${email}`);
      } else {
        // Ensure role is SUPER_ADMIN and status is ACTIVE
        if (existingAdmin.role !== Role.SUPER_ADMIN || existingAdmin.accountStatus !== UserStatus.ACTIVE) {
          existingAdmin.role = Role.SUPER_ADMIN;
          existingAdmin.accountStatus = UserStatus.ACTIVE;
          await existingAdmin.save();
          this.logger.log(`Super Admin role/status refreshed for: ${email}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error bootstrapping Super Admin: ${(error as any).message}`);
    }
  }
}
