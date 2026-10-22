import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RefundPaymentDto {
  @ApiPropertyOptional({ description: 'Refund amount in standard currency unit (defaults to full order amount)', example: 250.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiPropertyOptional({ description: 'Reason for processing refund', maxLength: 250 })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  reason?: string;
}
