import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { QrType } from '../../../common/enums/index.js';

export class GenerateQrDto {
  @ApiProperty({ enum: QrType, example: QrType.RESTAURANT_MENU })
  @IsEnum(QrType)
  @IsNotEmpty()
  qrType: QrType;

  @ApiPropertyOptional({ description: 'Dish ID (required if qrType is DISH_DIRECT)' })
  @IsOptional()
  @IsMongoId()
  dishId?: string;
}
