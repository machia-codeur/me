import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InitPaymentDto {
  @ApiProperty()
  @IsUUID()
  orderId: string;

  @ApiProperty({ enum: ['cinetpay', 'flutterwave'] })
  @IsEnum(['cinetpay', 'flutterwave'])
  provider: 'cinetpay' | 'flutterwave';

  @ApiPropertyOptional({ description: 'Payment channels (e.g. MOBILE_MONEY, card)' })
  @IsString({ each: true })
  @IsOptional()
  channels?: string[];
}
