import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import QRCode from 'qrcode';
import {
  QrCode,
  QrCodeDocument,
  Restaurant,
  RestaurantDocument,
  Dish,
  DishDocument,
} from '../../database/schemas/index.js';
import { QrStatus, QrType } from '../../common/enums/index.js';
import { GenerateQrDto } from './dto/generate-qr.dto.js';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';
import { TenantValidator } from '../../common/utils/tenant.util.js';
import { AuditService } from '../audit/audit.service.js';

@Injectable()
export class QrService {
  constructor(
    @InjectModel(QrCode.name)
    private readonly qrModel: Model<QrCodeDocument>,
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
    @InjectModel(Dish.name)
    private readonly dishModel: Model<DishDocument>,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  private async generateQrImageData(url: string): Promise<string> {
    return QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: 2,
      scale: 8,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
    });
  }

  async generate(user: AuthenticatedUser, restaurantId: string, dto: GenerateQrDto) {
    await TenantValidator.assertRestaurantAccess(user, restaurantId, this.restaurantModel);

    const rObjectId = new Types.ObjectId(restaurantId);
    const restaurant = await this.restaurantModel.findById(rObjectId).exec();
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const frontendBaseUrl =
      this.configService.get<string>('frontendBaseUrl') || 'http://localhost:3000';

    let targetUrl = '';
    let dObjectId: Types.ObjectId | undefined;

    if (dto.qrType === QrType.RESTAURANT_MENU) {
      targetUrl = `${frontendBaseUrl}/r/${restaurant.slug}`;
    } else if (dto.qrType === QrType.DISH_DIRECT) {
      if (!dto.dishId) {
        throw new BadRequestException('dishId is required for DISH_DIRECT QR code');
      }

      const dish = await this.dishModel.findOne({
        _id: new Types.ObjectId(dto.dishId),
        restaurantId: rObjectId,
      }).exec();

      if (!dish) {
        throw new NotFoundException('Dish not found for this restaurant');
      }

      dObjectId = dish._id as Types.ObjectId;
      targetUrl = `${frontendBaseUrl}/r/${restaurant.slug}/d/${dish.slug}`;
    }

    const imageData = await this.generateQrImageData(targetUrl);

    // Check if QR already exists for this target
    const existing = await this.qrModel.findOne({
      restaurantId: rObjectId,
      qrType: dto.qrType,
      dishId: dObjectId,
    }).exec();

    let qrCodeDoc: QrCodeDocument;
    if (existing) {
      existing.targetUrl = targetUrl;
      existing.imageData = imageData;
      existing.status = QrStatus.ACTIVE;
      qrCodeDoc = await existing.save();
    } else {
      qrCodeDoc = await this.qrModel.create({
        restaurantId: rObjectId,
        dishId: dObjectId,
        qrType: dto.qrType,
        targetUrl,
        imageData,
        status: QrStatus.ACTIVE,
        createdBy: new Types.ObjectId(user.userId),
      });
    }

    await this.auditService.log({
      actorId: user.userId,
      restaurantId,
      action: 'GENERATE_QR',
      entityType: 'QrCode',
      entityId: qrCodeDoc._id.toString(),
      safeMetadata: { qrType: dto.qrType, targetUrl },
    });

    return qrCodeDoc;
  }

  async regenerate(user: AuthenticatedUser, restaurantId: string, qrId: string) {
    await TenantValidator.assertRestaurantAccess(user, restaurantId, this.restaurantModel);

    const qr = await this.qrModel.findOne({
      _id: new Types.ObjectId(qrId),
      restaurantId: new Types.ObjectId(restaurantId),
    }).exec();

    if (!qr) {
      throw new NotFoundException('QR Code not found');
    }

    // Regenerate QR image preserving the stable target URL
    qr.imageData = await this.generateQrImageData(qr.targetUrl);
    await qr.save();

    await this.auditService.log({
      actorId: user.userId,
      restaurantId,
      action: 'REGENERATE_QR',
      entityType: 'QrCode',
      entityId: qrId,
      safeMetadata: { targetUrl: qr.targetUrl },
    });

    return qr;
  }

  async findByRestaurant(user: AuthenticatedUser, restaurantId: string) {
    await TenantValidator.assertRestaurantAccess(user, restaurantId, this.restaurantModel);

    return this.qrModel
      .find({ restaurantId: new Types.ObjectId(restaurantId) })
      .populate('dishId', 'name slug price')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(user: AuthenticatedUser, restaurantId: string, qrId: string) {
    await TenantValidator.assertRestaurantAccess(user, restaurantId, this.restaurantModel);

    const qr = await this.qrModel.findOne({
      _id: new Types.ObjectId(qrId),
      restaurantId: new Types.ObjectId(restaurantId),
    }).populate('dishId', 'name slug price').exec();

    if (!qr) {
      throw new NotFoundException('QR Code not found');
    }

    return qr;
  }
}
