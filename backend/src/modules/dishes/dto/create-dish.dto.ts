import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateDishDto {
  @ApiProperty({ example: 'Saffron Badam Kheer' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'saffron-badam-kheer' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ description: 'Category ID within the same restaurant' })
  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({ example: 'Slow cooked aromatic rice pudding with Kashmiri saffron and crushed almonds' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 8.5 })
  @IsNumber()
  @Min(0, { message: 'Price must be non-negative' })
  price: number;

  @ApiPropertyOptional({ default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string = 'USD';

  @ApiPropertyOptional({ type: [String], example: ['https://example.com/kheer.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[] = [];

  @ApiPropertyOptional({ example: 'https://example.com/kheer.glb' })
  @IsOptional()
  @IsString()
  model3dUrl?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean = true;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean = false;

  @ApiPropertyOptional({ type: [String], example: ['VEG', 'GLUTEN_FREE'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryFlags?: string[] = [];

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number = 0;
}
