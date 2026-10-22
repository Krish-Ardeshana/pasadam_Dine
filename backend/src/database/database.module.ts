import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  User,
  UserSchema,
  Restaurant,
  RestaurantSchema,
  Category,
  CategorySchema,
  Dish,
  DishSchema,
  MediaAsset,
  MediaAssetSchema,
  QrCode,
  QrCodeSchema,
  AuditLog,
  AuditLogSchema,
  Order,
  OrderSchema,
} from './schemas/index.js';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Dish.name, schema: DishSchema },
      { name: MediaAsset.name, schema: MediaAssetSchema },
      { name: QrCode.name, schema: QrCodeSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
