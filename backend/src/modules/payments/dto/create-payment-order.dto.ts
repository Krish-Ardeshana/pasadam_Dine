import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentOrderDto {
  @ApiProperty({ description: 'Order number to initiate payment for', example: 'ORD-20261022-A101' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  orderNumber: string;
}
