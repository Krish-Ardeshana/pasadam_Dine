import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Types } from 'mongoose';
import { QrService } from './qr.service.js';
import { QrType, Role } from '../../common/enums/index.js';

describe('QrService', () => {
  let qrService: QrService;
  let mockQrModel: any;
  let mockRestaurantModel: any;
  let mockDishModel: any;
  let mockConfigService: any;
  let mockAuditService: any;

  const mockRestaurantId = new Types.ObjectId().toString();
  const mockDishId = new Types.ObjectId().toString();

  const mockUser = {
    userId: new Types.ObjectId().toString(),
    email: 'owner@prasadam.com',
    role: Role.RESTAURANT_OWNER,
    restaurantAssignments: [mockRestaurantId],
    permissions: [],
  };

  beforeEach(() => {
    mockQrModel = {
      findOne: vi.fn(),
      create: vi.fn(),
      find: vi.fn(),
    };

    mockRestaurantModel = {
      findById: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue({
          _id: new Types.ObjectId(mockRestaurantId),
          slug: 'prasadam-bhavan',
          name: 'Prasadam Bhavan',
        }),
      }),
    };

    mockDishModel = {
      findOne: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue({
          _id: new Types.ObjectId(mockDishId),
          slug: 'special-thali',
          name: 'Special Sattvic Thali',
        }),
      }),
    };

    mockConfigService = {
      get: vi.fn((key: string) => {
        if (key === 'frontendBaseUrl') return 'https://prasadamdine.com';
        return null;
      }),
    };

    mockAuditService = {
      log: vi.fn().mockResolvedValue({}),
    };

    qrService = new QrService(
      mockQrModel,
      mockRestaurantModel,
      mockDishModel,
      mockConfigService,
      mockAuditService,
    );
  });

  it('should generate restaurant menu QR with URL pattern /r/{slug}', async () => {
    mockQrModel.findOne.mockReturnValue({ exec: vi.fn().mockResolvedValue(null) });
    mockQrModel.create.mockImplementation((doc: any) => Promise.resolve({ _id: 'qr-1', ...doc }));

    const result = await qrService.generate(mockUser, mockRestaurantId, {
      qrType: QrType.RESTAURANT_MENU,
    });

    expect(result.targetUrl).toBe('https://prasadamdine.com/r/prasadam-bhavan');
    expect(result.imageData).toContain('data:image/png;base64,');
    expect(mockAuditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'GENERATE_QR' }),
    );
  });

  it('should generate dish direct QR with URL pattern /r/{restaurantSlug}/d/{dishSlug}', async () => {
    mockQrModel.findOne.mockReturnValue({ exec: vi.fn().mockResolvedValue(null) });
    mockQrModel.create.mockImplementation((doc: any) => Promise.resolve({ _id: 'qr-2', ...doc }));

    const result = await qrService.generate(mockUser, mockRestaurantId, {
      qrType: QrType.DISH_DIRECT,
      dishId: mockDishId,
    });

    expect(result.targetUrl).toBe('https://prasadamdine.com/r/prasadam-bhavan/d/special-thali');
    expect(result.imageData).toContain('data:image/png;base64,');
  });

  it('should throw BadRequestException if dishId is missing for DISH_DIRECT', async () => {
    await expect(
      qrService.generate(mockUser, mockRestaurantId, {
        qrType: QrType.DISH_DIRECT,
      }),
    ).rejects.toThrow();
  });
});
