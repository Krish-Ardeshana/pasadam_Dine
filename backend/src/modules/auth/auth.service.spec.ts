import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { AuthService } from './auth.service.js';
import { Role, UserStatus } from '../../common/enums/index.js';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserModel: any;
  let mockJwtService: any;
  let mockConfigService: any;
  let mockAuditService: any;

  beforeEach(() => {
    mockUserModel = {
      findOne: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
      findByIdAndUpdate: vi.fn().mockReturnValue({ exec: vi.fn() }),
    };

    mockJwtService = {
      signAsync: vi.fn().mockImplementation((payload) => Promise.resolve(`jwt_token_${payload.sub}`)),
      verify: vi.fn(),
    };

    mockConfigService = {
      get: vi.fn((key: string) => {
        if (key === 'jwt.secret') return 'test_jwt_secret';
        if (key === 'jwt.refreshSecret') return 'test_refresh_secret';
        if (key === 'jwt.expiresIn') return '1d';
        if (key === 'jwt.refreshExpiresIn') return '7d';
        return null;
      }),
    };

    mockAuditService = {
      log: vi.fn().mockResolvedValue({}),
    };

    authService = new AuthService(
      mockUserModel,
      mockJwtService,
      mockConfigService,
      mockAuditService,
    );
  });

  describe('register', () => {
    it('should successfully register a restaurant owner and hash their password', async () => {
      mockUserModel.findOne.mockReturnValue({ exec: vi.fn().mockResolvedValue(null) });

      const fakeUserId = new Types.ObjectId();
      mockUserModel.create.mockImplementation((doc: any) =>
        Promise.resolve({
          _id: fakeUserId,
          ...doc,
        }),
      );

      const result = await authService.register({
        name: 'Govinda Das',
        email: 'govinda@prasadam.com',
        password: 'Password123!',
        role: Role.RESTAURANT_OWNER,
      });

      expect(result.user.email).toBe('govinda@prasadam.com');
      expect(result.user.role).toBe(Role.RESTAURANT_OWNER);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();

      // Ensure password was hashed before creating
      const createCall = mockUserModel.create.mock.calls[0][0];
      expect(createCall.passwordHash).not.toBe('Password123!');
      const isMatch = await bcrypt.compare('Password123!', createCall.passwordHash);
      expect(isMatch).toBe(true);
    });

    it('should prevent self-registration with SUPER_ADMIN role (downgrade to RESTAURANT_OWNER)', async () => {
      mockUserModel.findOne.mockReturnValue({ exec: vi.fn().mockResolvedValue(null) });
      const fakeUserId = new Types.ObjectId();
      mockUserModel.create.mockImplementation((doc: any) =>
        Promise.resolve({
          _id: fakeUserId,
          ...doc,
        }),
      );

      const result = await authService.register({
        name: 'Hacker Admin',
        email: 'hacker@prasadam.com',
        password: 'Password123!',
        role: Role.SUPER_ADMIN,
      });

      expect(result.user.role).toBe(Role.RESTAURANT_OWNER);
    });

    it('should throw ConflictException if email is already taken', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: vi.fn().mockResolvedValue({ email: 'existing@prasadam.com' }),
      });

      await expect(
        authService.register({
          name: 'Another User',
          email: 'existing@prasadam.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should authenticate user and return tokens when credentials are valid', async () => {
      const plainPassword = 'SecretPassword123!';
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(plainPassword, salt);
      const fakeUserId = new Types.ObjectId();

      mockUserModel.findOne.mockReturnValue({
        select: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue({
            _id: fakeUserId,
            email: 'user@prasadam.com',
            name: 'User',
            role: Role.RESTAURANT_OWNER,
            accountStatus: UserStatus.ACTIVE,
            passwordHash,
            restaurantAssignments: [],
          }),
        }),
      });

      const result = await authService.login({
        email: 'user@prasadam.com',
        password: plainPassword,
      });

      expect(result.accessToken).toBeDefined();
      expect(result.user.email).toBe('user@prasadam.com');
    });

    it('should reject login (UnauthorizedException) if password does not match', async () => {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('CorrectPassword', salt);

      mockUserModel.findOne.mockReturnValue({
        select: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue({
            _id: new Types.ObjectId(),
            email: 'user@prasadam.com',
            accountStatus: UserStatus.ACTIVE,
            passwordHash,
          }),
        }),
      });

      await expect(
        authService.login({
          email: 'user@prasadam.com',
          password: 'WrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject login if accountStatus is SUSPENDED', async () => {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('Password123!', salt);

      mockUserModel.findOne.mockReturnValue({
        select: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue({
            _id: new Types.ObjectId(),
            email: 'suspended@prasadam.com',
            accountStatus: UserStatus.SUSPENDED,
            passwordHash,
          }),
        }),
      });

      await expect(
        authService.login({
          email: 'suspended@prasadam.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
