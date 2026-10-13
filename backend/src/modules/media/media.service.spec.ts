import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { MediaService } from './media.service.js';
import { MediaType, Role, StorageProvider } from '../../common/enums/index.js';

describe('MediaService Validation', () => {
  let mediaService: MediaService;
  let mockMediaModel: any;
  let mockRestaurantModel: any;
  let mockDishModel: any;
  let mockConfigService: any;
  let mockLocalStorageProvider: any;
  let mockCloudinaryProvider: any;
  let mockAuditService: any;

  const mockRestaurantId = new Types.ObjectId().toString();
  const mockUser = {
    userId: new Types.ObjectId().toString(),
    email: 'chef@prasadam.com',
    role: Role.RESTAURANT_OWNER,
    restaurantAssignments: [mockRestaurantId],
    permissions: [],
  };

  beforeEach(() => {
    mockMediaModel = {
      create: vi.fn().mockImplementation((doc) => Promise.resolve({ _id: 'media-1', ...doc })),
      findOne: vi.fn(),
      find: vi.fn(),
    };

    mockRestaurantModel = {
      findById: vi.fn(),
      findByIdAndUpdate: vi.fn().mockReturnValue({ exec: vi.fn() }),
    };

    mockDishModel = {
      findOne: vi.fn(),
      findByIdAndUpdate: vi.fn().mockReturnValue({ exec: vi.fn() }),
    };

    mockConfigService = {
      get: vi.fn((key: string) => {
        if (key === 'media.maxFileSizeMb') return 15;
        if (key === 'media.driver') return 'local';
        return null;
      }),
    };

    mockLocalStorageProvider = {
      uploadFile: vi.fn().mockResolvedValue({
        fileUrl: '/api/v1/media/file/test.png',
        publicId: 'test.png',
        provider: StorageProvider.LOCAL,
        fileSize: 1024,
        mimeType: 'image/png',
      }),
      deleteFile: vi.fn().mockResolvedValue(true),
      getFilePath: vi.fn().mockReturnValue('/uploads/test.png'),
    };

    mockCloudinaryProvider = {
      isAvailable: vi.fn().mockReturnValue(false),
      uploadFile: vi.fn(),
      deleteFile: vi.fn(),
    };

    mockAuditService = {
      log: vi.fn().mockResolvedValue({}),
    };

    mediaService = new MediaService(
      mockMediaModel,
      mockRestaurantModel,
      mockDishModel,
      mockConfigService,
      mockLocalStorageProvider,
      mockCloudinaryProvider,
      mockAuditService,
    );
  });

  it('should reject file when no file is provided', async () => {
    await expect(
      mediaService.uploadMedia(mockUser, mockRestaurantId, null as any, MediaType.IMAGE),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject file that exceeds maximum size limit (15MB)', async () => {
    const oversizedFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'huge_model.glb',
      encoding: '7bit',
      mimetype: 'model/gltf-binary',
      size: 20 * 1024 * 1024, // 20MB
      buffer: Buffer.alloc(100),
      stream: null as any,
      destination: '',
      filename: '',
      path: '',
    };

    await expect(
      mediaService.uploadMedia(mockUser, mockRestaurantId, oversizedFile, MediaType.MODEL_3D),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject invalid image MIME types (e.g. text/html, application/x-msdownload)', async () => {
    const maliciousFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'exploit.html',
      encoding: '7bit',
      mimetype: 'text/html',
      size: 1024,
      buffer: Buffer.from('<script>alert("hack")</script>'),
      stream: null as any,
      destination: '',
      filename: '',
      path: '',
    };

    await expect(
      mediaService.uploadMedia(mockUser, mockRestaurantId, maliciousFile, MediaType.IMAGE),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject non-glb/gltf extensions for 3D model uploads', async () => {
    const invalid3dFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'model.exe',
      encoding: '7bit',
      mimetype: 'application/octet-stream',
      size: 2048,
      buffer: Buffer.from('binary-content'),
      stream: null as any,
      destination: '',
      filename: '',
      path: '',
    };

    await expect(
      mediaService.uploadMedia(mockUser, mockRestaurantId, invalid3dFile, MediaType.MODEL_3D),
    ).rejects.toThrow(BadRequestException);
  });

  it('should accept valid PNG image upload', async () => {
    const validImage: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'dish.png',
      encoding: '7bit',
      mimetype: 'image/png',
      size: 4096,
      buffer: Buffer.from('image-binary-data'),
      stream: null as any,
      destination: '',
      filename: '',
      path: '',
    };

    const result = await mediaService.uploadMedia(
      mockUser,
      mockRestaurantId,
      validImage,
      MediaType.IMAGE,
    );

    expect(result.fileUrl).toBe('/api/v1/media/file/test.png');
    expect(mockLocalStorageProvider.uploadFile).toHaveBeenCalled();
  });
});
