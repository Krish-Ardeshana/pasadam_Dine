import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPaymentDto {
  @ApiProperty({ description: 'Razorpay Order ID returned by checkout', example: 'order_NxABC12345678' })
  @IsString()
  @IsNotEmpty()
  razorpayOrderId: string;

  @ApiProperty({ description: 'Razorpay Payment ID returned upon successful customer transaction', example: 'pay_NxXYZ12345678' })
  @IsString()
  @IsNotEmpty()
  razorpayPaymentId: string;

  @ApiProperty({ description: 'HMAC SHA256 payment signature returned by checkout', example: '9ef87b32c...' })
  @IsString()
  @IsNotEmpty()
  razorpaySignature: string;
}
