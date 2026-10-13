import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from '../../../common/enums/index.js';

export class CreateStaffDto {
  @ApiProperty({ example: 'John Staff' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'staff@restaurant.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'TempPass123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    enum: [Role.RESTAURANT_MANAGER, Role.RESTAURANT_STAFF],
    default: Role.RESTAURANT_STAFF,
  })
  @IsEnum([Role.RESTAURANT_MANAGER, Role.RESTAURANT_STAFF])
  role: Role;

  @ApiProperty({ description: 'Restaurant ID to assign staff to' })
  @IsMongoId()
  @IsNotEmpty()
  restaurantId: string;
}

export class AssignRestaurantDto {
  @ApiProperty({ description: 'Target user ID' })
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Restaurant ID to assign' })
  @IsMongoId()
  @IsNotEmpty()
  restaurantId: string;
}
