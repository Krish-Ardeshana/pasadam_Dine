import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import path from 'path';
import {
  MediaAsset,
  MediaAssetDocument,
  Restaurant,
  RestaurantDocument,
  Dish,
  DishDocument,
} from '../../database/schemas/index.js';
import { MediaType, StorageProvider } from '../../common/enums/index.js';
import { LocalStorageProvider } from './providers/local-storage.provider.js';
import { CloudinaryStorageProvider } from './providers/cloudinary-storage.provider.js';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';
import { TenantValidator } from '../../common/utils/tenant.util.js';
import { AuditService } from '../audit/audit.service.js';

const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
];

const ALLOWED_3D_EXTENSIONS = ['.glb', '.gltf'];

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @InjectModel(MediaAsset.name)
    private readonly mediaModel: Model<MediaAssetDocument>,
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
    @InjectModel(Dish.name)
    private readonly dishModel: Model<DishDocument>,
    private readonly configService: ConfigService,
    private readonly localStorageProvider: LocalStorageProvider,
    private readonly cloudinaryProvider: CloudinaryStorageProvider,
    private readonly auditService: AuditService,
  ) {}

  async uploadMedia(
    user: AuthenticatedUser,
    restaurantId: string,
    file: Express.Multer.File,
    mediaType: MediaType,
    dishId?: string,
  ) {
    await TenantValidator.assertRestaurantAccess(user, restaurantId, this.restaurantModel);

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const maxFileSizeMb = this.configService.get<number>('media.maxFileSizeMb') || 15;
    const maxBytes = maxFileSizeMb * 1024 * 1024;

    if (file.size > maxBytes) {
      throw new BadRequestException(`File size exceeds maximum limit of ${maxFileSizeMb}MB`);
    }

    let resourceType: 'image' | 'raw' | 'auto' = 'auto';

    if (mediaType === MediaType.IMAGE || mediaType === MediaType.LOGO) {
      if (!ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
        throw new BadRequestException(
          `Invalid image type: ${file.mimetype}. Allowed types: JPEG, PNG, WEBP, SVG`,
        );
      }
      resourceType = 'image';
    } else if (mediaType === MediaType.MODEL_3D) {
      if (!ALLOWED_3D_EXTENSIONS.includes(ext)) {
        throw new BadRequestException(
          `Invalid 3D model file extension: ${ext}. Only .glb and .gltf files are supported.`,
        );
      }
      resourceType = 'raw';
    }

    // Verify dish belongs to this restaurant if dishId is provided
    let dObjectId: Types.ObjectId | undefined;
    if (dishId) {
      const dish = await this.dishModel.findOne({
        _id: new Types.ObjectId(dishId),
        restaurantId: new Types.ObjectId(restaurantId),
      }).exec();

      if (!dish) {
        throw new BadRequestException('Dish does not exist or belong to this restaurant');
      }
      dObjectId = dish._id as Types.ObjectId;
    }

    const preferredDriver = this.configService.get<string>('media.driver');
    const useCloudinary =
      preferredDriver === 'cloudinary' && this.cloudinaryProvider.isAvailable();

    const folder = `prasadam_dine/${restaurantId}`;
    const uploadResult = useCloudinary
      ? await this.cloudinaryProvider.uploadFile(file, folder, resourceType)
      : await this.localStorageProvider.uploadFile(file, restaurantId);

    const asset = await this.mediaModel.create({
      restaurantId: new Types.ObjectId(restaurantId),
      dishId: dObjectId,
      mediaType,
      storageProvider: uploadResult.provider,
      fileUrl: uploadResult.fileUrl,
      publicId: uploadResult.publicId,
      mimeType: file.mimetype,
      fileSize: uploadResult.fileSize,
      originalFilename: file.originalname,
      uploadedBy: new Types.ObjectId(user.userId),
    });

    // If attached to dish or logo, update respective record automatically
    if (dishId && mediaType === MediaType.IMAGE) {
      await this.dishModel.findByIdAndUpdate(dishId, {
        $addToSet: { imageUrls: asset.fileUrl },
      }).exec();
    } else if (dishId && mediaType === MediaType.MODEL_3D) {
      await this.dishModel.findByIdAndUpdate(dishId, {
        model3dUrl: asset.fileUrl,
      }).exec();
    } else if (mediaType === MediaType.LOGO) {
      await this.restaurantModel.findByIdAndUpdate(restaurantId, {
        logoUrl: asset.fileUrl,
      }).exec();
    }

    await this.auditService.log({
      actorId: user.userId,
      restaurantId,
      action: 'UPLOAD_MEDIA',
      entityType: 'MediaAsset',
      entityId: asset._id.toString(),
      safeMetadata: {
        mediaType,
        provider: asset.storageProvider,
        fileUrl: asset.fileUrl,
      },
    });

    return asset;
  }

  async findByRestaurant(user: AuthenticatedUser, restaurantId: string) {
    await TenantValidator.assertRestaurantAccess(user, restaurantId, this.restaurantModel);

    return this.mediaModel
      .find({ restaurantId: new Types.ObjectId(restaurantId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async deleteMedia(user: AuthenticatedUser, restaurantId: string, assetId: string) {
    await TenantValidator.assertRestaurantAccess(user, restaurantId, this.restaurantModel);

    const asset = await this.mediaModel.findOne({
      _id: new Types.ObjectId(assetId),
      restaurantId: new Types.ObjectId(restaurantId),
    }).exec();

    if (!asset) {
      throw new NotFoundException('Media asset not found for this restaurant');
    }

    if (asset.storageProvider === StorageProvider.CLOUDINARY) {
      const resourceType = asset.mediaType === MediaType.MODEL_3D ? 'raw' : 'image';
      await this.cloudinaryProvider.deleteFile(asset.publicId || '', resourceType);
    } else {
      await this.localStorageProvider.deleteFile(asset.publicId || '');
    }

    // Remove reference from dish if applicable
    if (asset.dishId) {
      await this.dishModel.findByIdAndUpdate(asset.dishId, {
        $pull: { imageUrls: asset.fileUrl },
      }).exec();
    }

    await this.mediaModel.findByIdAndDelete(asset._id).exec();

    await this.auditService.log({
      actorId: user.userId,
      restaurantId,
      action: 'DELETE_MEDIA',
      entityType: 'MediaAsset',
      entityId: assetId,
      safeMetadata: { fileUrl: asset.fileUrl },
    });

    return { success: true, message: 'Media asset deleted successfully' };
  }

  getLocalFilePath(publicId: string): string | null {
    return this.localStorageProvider.getFilePath(publicId);
  }
}
