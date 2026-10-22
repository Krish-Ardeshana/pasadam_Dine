import {
  IsArray,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderPaymentMethod, OrderType } from '../../../common/enums/index.js';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'MongoDB ObjectId of the dish' })
  @IsMongoId()
  @IsNotEmpty()
  dishId: string;

  @ApiProperty({ description: 'Item quantity (1 - 50)', minimum: 1, maximum: 50, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  quantity: number;

  @ApiPropertyOptional({ description: 'Item specific instructions, e.g., mild spice', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  instructions?: string;
}

export class CreateOrderDto {
  @ApiPropertyOptional({ enum: OrderType, default: OrderType.DINE_IN })
  @IsOptional()
  @IsEnum(OrderType)
  orderType?: OrderType = OrderType.DINE_IN;

  @ApiPropertyOptional({ description: 'Table identifier, e.g. Table 4', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tableNumber?: string;

  @ApiPropertyOptional({ description: 'Customer contact name', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  customerName?: string;

  @ApiPropertyOptional({ description: 'Customer phone number', maxLength: 25 })
  @IsOptional()
  @IsString()
  @MaxLength(25)
  customerPhone?: string;

  @ApiPropertyOptional({ description: 'Special order-level instructions', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  specialInstructions?: string;

  @ApiPropertyOptional({ enum: OrderPaymentMethod, default: OrderPaymentMethod.PAY_AT_TABLE })
  @IsOptional()
  @IsEnum(OrderPaymentMethod)
  paymentMethod?: OrderPaymentMethod = OrderPaymentMethod.PAY_AT_TABLE;

  @ApiProperty({ type: [CreateOrderItemDto], description: 'List of order items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
