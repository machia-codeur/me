import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OpenDisputeDto {
  @ApiProperty()
  @IsUUID()
  orderId: string;

  @ApiProperty({ example: 'Item not as described' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
