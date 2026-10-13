import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CategoryStatus } from '../../../common/enums/index.js';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Sattvic Starters' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Fresh and light traditional offerings' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number = 0;

  @ApiPropertyOptional({ enum: CategoryStatus, default: CategoryStatus.ACTIVE })
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus = CategoryStatus.ACTIVE;
}

export class CategoryOrderItem {
  @ApiProperty()
  @IsMongoId()
  id: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  displayOrder: number;
}

export class ReorderCategoriesDto {
  @ApiProperty({ type: [CategoryOrderItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryOrderItem)
  orders: CategoryOrderItem[];
}
