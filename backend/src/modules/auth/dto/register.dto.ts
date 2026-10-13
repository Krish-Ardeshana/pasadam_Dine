import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '../../../common/enums/index.js';

export class RegisterDto {
  @ApiProperty({ example: 'Chef Krishna' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'krishna@prasadam.com' })
  @IsEmail({}, { message: 'A valid email address is required' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiPropertyOptional({
    enum: [Role.RESTAURANT_OWNER, Role.CUSTOMER],
    default: Role.RESTAURANT_OWNER,
    description: 'Registration role (SUPER_ADMIN cannot be self-registered)',
  })
  @IsOptional()
  @IsEnum([Role.RESTAURANT_OWNER, Role.CUSTOMER], {
    message: 'Allowed registration roles are RESTAURANT_OWNER or CUSTOMER',
  })
  role?: Role = Role.RESTAURANT_OWNER;
}
