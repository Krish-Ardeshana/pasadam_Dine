import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Types } from 'mongoose';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PublicMenuService } from '../modules/public-menu/public-menu.service.js';
import { QrService } from '../modules/qr/qr.service.js';
import { MediaService } from '../modules/media/media.service.js';
import { Role, RestaurantApprovalStatus, CategoryStatus, QrType, MediaType } from '../common/enums/index.js';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator.js';

describe('Phase 3 E2E Integration & Security Flows', () => {
  const restaurantAId = new Types.ObjectId().toString();
  const restaurantBId = new Types.ObjectId().toString();
  const category1Id = new Types.ObjectId().toString();
  const dish1Id = new Types.ObjectId().toString();

  const ownerA: AuthenticatedUser = {
    userId: new Types.ObjectId().toString(),
    email: 'owner-a@prasadam.com',
    role: Role.RESTAURANT_OWNER,
    restaurantAssignments: [restaurantAId],
    permissions: [],
  };

  const managerB: AuthenticatedUser = {
    userId: new Types.ObjectId().toString(),
    email: 'manager-b@prasadam.com',
    role: Role.RESTAURANT_MANAGER,
    restaurantAssignments: [restaurantBId],
    permissions: [],
  };

  // Mock document stores
  let mockRestaurantModel: any;
  let mockCategoryModel: any;
  let mockDishModel: any;
  let mockQrModel: any;
  let mockMediaModel: any;
  let mockAuditService: any;
  let mockConfigService: any;

  let publicMenuService: PublicMenuService;
  let qrService: QrService;
  let mediaService: MediaService;

  beforeEach(() => {
    mockRestaurantModel = {
      findOne: vi.fn(),
      findById: vi.fn((id: string | Types.ObjectId) => ({
        select: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue({
            _id: new Types.ObjectId(id.toString()),
            slug: 'prasadam-anand',
            name: 'Prasadam Anand Bhavan',
            approvalStatus: RestaurantApprovalStatus.APPROVED,
            isActive: true,
            ownerId: new Types.ObjectId(ownerA.userId),
          }),
        }),
        exec: vi.fn().mockResolvedValue({
          _id: new Types.ObjectId(id.toString()),
          slug: 'prasadam-anand',
          name: 'Prasadam Anand Bhavan',
          approvalStatus: RestaurantApprovalStatus.APPROVED,
          isActive: true,
          ownerId: new Types.ObjectId(ownerA.userId),
        }),
      })),
    };

    mockCategoryModel = {
      find: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            exec: vi.fn().mockResolvedValue([
              {
                _id: new Types.ObjectId(category1Id),
                name: 'Traditional Thalis',
                description: 'Full course pure sattvic meals',
                displayOrder: 1,
                status: CategoryStatus.ACTIVE,
              },
            ]),
          }),
        }),
      }),
      findOne: vi.fn(),
    };

    mockDishModel = {
      find: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            exec: vi.fn().mockResolvedValue([
              {
                _id: new Types.ObjectId(dish1Id),
                restaurantId: new Types.ObjectId(restaurantAId),
                categoryId: new Types.ObjectId(category1Id),
                name: 'Royal Govinda Thali',
                slug: 'royal-govinda-thali',
                price: 18.5,
                currency: 'USD',
                imageUrls: ['https://storage.prasadamdine.com/govinda-thali.jpg'],
                model3dUrl: 'https://storage.prasadamdine.com/govinda-thali.glb',
                isAvailable: true,
                isPublished: true,
                dietaryFlags: ['VEG', 'SATTVIC'],
                displayOrder: 1,
              },
            ]),
          }),
        }),
      }),
      findOne: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          populate: vi.fn().mockReturnValue({
            exec: vi.fn().mockResolvedValue({
              _id: new Types.ObjectId(dish1Id),
              restaurantId: new Types.ObjectId(restaurantAId),
              categoryId: { _id: category1Id, name: 'Traditional Thalis' },
              name: 'Royal Govinda Thali',
              slug: 'royal-govinda-thali',
              price: 18.5,
              currency: 'USD',
              imageUrls: ['https://storage.prasadamdine.com/govinda-thali.jpg'],
              model3dUrl: 'https://storage.prasadamdine.com/govinda-thali.glb',
              isAvailable: true,
              isPublished: true,
            }),
          }),
        }),
        exec: vi.fn().mockResolvedValue({
          _id: new Types.ObjectId(dish1Id),
          restaurantId: new Types.ObjectId(restaurantAId),
          slug: 'royal-govinda-thali',
          name: 'Royal Govinda Thali',
        }),
      }),
    };

    mockQrModel = {
      findOne: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(null) }),
      create: vi.fn().mockImplementation((doc: any) => Promise.resolve({ _id: 'qr-test-1', ...doc })),
      find: vi.fn(),
    };

    mockMediaModel = {
      create: vi.fn().mockImplementation((doc: any) => Promise.resolve({ _id: 'media-test-1', ...doc })),
      find: vi.fn(),
      findOne: vi.fn(),
      findByIdAndDelete: vi.fn(),
    };

    mockAuditService = {
      log: vi.fn().mockResolvedValue({}),
    };

    mockConfigService = {
      get: vi.fn((key: string) => {
        if (key === 'frontendBaseUrl') return 'https://prasadamdine.com';
        if (key === 'media.driver') return 'local';
        if (key === 'media.uploadDir') return './uploads';
        if (key === 'media.maxFileSizeMb') return 15;
        return null;
      }),
    };

    publicMenuService = new PublicMenuService(
      mockRestaurantModel,
      mockCategoryModel,
      mockDishModel,
    );

    qrService = new QrService(
      mockQrModel,
      mockRestaurantModel,
      mockDishModel,
      mockConfigService,
      mockAuditService,
    );

    mediaService = new MediaService(
      mockMediaModel,
      mockRestaurantModel,
      mockDishModel,
      mockConfigService,
      mockAuditService,
    );
  });

  describe('Flow A & B: Public Menu & 3D AR Dish Presentation', () => {
    it('should retrieve full grouped public menu for an active, approved restaurant', async () => {
      mockRestaurantModel.findOne.mockReturnValue({
        select: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue({
            _id: new Types.ObjectId(restaurantAId),
            name: 'Prasadam Anand Bhavan',
            slug: 'prasadam-anand',
            approvalStatus: RestaurantApprovalStatus.APPROVED,
            isActive: true,
          }),
        }),
      });

      const menu = await publicMenuService.getFullMenu('prasadam-anand');

      expect(menu.restaurant.slug).toBe('prasadam-anand');
      expect(menu.categories).toHaveLength(1);
      expect(menu.categories[0].name).toBe('Traditional Thalis');
      expect(menu.categories[0].dishes).toHaveLength(1);
      expect(menu.categories[0].dishes[0].model3dUrl).toBe(
        'https://storage.prasadamdine.com/govinda-thali.glb',
      );
    });

    it('should reject public access if the restaurant is SUSPENDED or INACTIVE', async () => {
      mockRestaurantModel.findOne.mockReturnValue({
        select: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(null), // Suspended or inactive restaurants return null
        }),
      });

      await expect(publicMenuService.getFullMenu('suspended-restaurant')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should retrieve individual dish details with 3D GLB model reference for AR viewer', async () => {
      mockRestaurantModel.findOne.mockReturnValue({
        select: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue({
            _id: new Types.ObjectId(restaurantAId),
            slug: 'prasadam-anand',
            name: 'Prasadam Anand Bhavan',
            approvalStatus: RestaurantApprovalStatus.APPROVED,
            isActive: true,
          }),
        }),
      });

      const result = await publicMenuService.getDishBySlug('prasadam-anand', 'royal-govinda-thali');

      expect(result.restaurant.slug).toBe('prasadam-anand');
      expect(result.dish.slug).toBe('royal-govinda-thali');
      expect(result.dish.model3dUrl).toContain('.glb');
      expect(result.dish.imageUrls).toHaveLength(1);
    });
  });

  describe('Flow C & D: Dynamic QR Code Generation & Stable URLs', () => {
    it('should generate restaurant menu QR pointing to canonical /r/{slug} URL', async () => {
      const qr = await qrService.generate(ownerA, restaurantAId, {
        qrType: QrType.RESTAURANT_MENU,
      });

      expect(qr.targetUrl).toBe('https://prasadamdine.com/r/prasadam-anand');
      expect(qr.imageData).toContain('data:image/png;base64,');
    });

    it('should generate direct dish QR pointing to canonical /r/{slug}/d/{dishSlug} URL', async () => {
      const qr = await qrService.generate(ownerA, restaurantAId, {
        qrType: QrType.DISH_DIRECT,
        dishId: dish1Id,
      });

      expect(qr.targetUrl).toBe('https://prasadamdine.com/r/prasadam-anand/d/royal-govinda-thali');
      expect(qr.imageData).toContain('data:image/png;base64,');
    });
  });

  describe('Flow E: Multi-Tenant Asset Isolation & IDOR Protection', () => {
    it('should reject Manager B trying to generate QR code for Restaurant A', async () => {
      await expect(
        qrService.generate(managerB, restaurantAId, {
          qrType: QrType.RESTAURANT_MENU,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject Manager B trying to upload media asset to Restaurant A', async () => {
      const dummyFile = {
        originalname: 'model.glb',
        mimetype: 'model/gltf-binary',
        size: 1024 * 50,
        buffer: Buffer.from('glTF binary mock'),
      } as Express.Multer.File;

      await expect(
        mediaService.uploadMedia(managerB, restaurantAId, dummyFile, MediaType.MODEL_3D),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject upload when file extension does not match mediaType', async () => {
      const invalidFile = {
        originalname: 'malicious.exe',
        mimetype: 'application/octet-stream',
        size: 1024 * 50,
        buffer: Buffer.from('malicious payload'),
      } as Express.Multer.File;

      await expect(
        mediaService.uploadMedia(ownerA, restaurantAId, invalidFile, MediaType.MODEL_3D),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
