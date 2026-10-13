import { PartialType, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { CreateDishDto } from './create-dish.dto.js';
import { PaginationDto } from '../../../common/dto/pagination.dto.js';

export class UpdateDishDto extends PartialType(CreateDishDto) {}

export class UpdateDishPriceDto {
  @ApiProperty({ example: 9.99 })
  @IsNumber()
  @Min(0)
  price: number;
}

export class UpdateDishAvailabilityDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isAvailable: boolean;
}

export class PublishDishDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isPublished: boolean;
}

export class DishFilterDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: 'VEG' })
  @IsOptional()
  @IsString()
  dietary?: string;
}
