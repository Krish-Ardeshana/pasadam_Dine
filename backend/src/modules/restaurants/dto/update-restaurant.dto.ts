import { PartialType, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { CreateRestaurantDto } from './create-restaurant.dto.js';
import { RestaurantApprovalStatus } from '../../../common/enums/index.js';

export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {}

export class UpdateApprovalStatusDto {
  @ApiProperty({ enum: RestaurantApprovalStatus })
  @IsEnum(RestaurantApprovalStatus)
  approvalStatus: RestaurantApprovalStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class TransferOwnershipDto {
  @ApiProperty({ description: 'New owner user ID' })
  @IsMongoId()
  newOwnerId: string;
}
