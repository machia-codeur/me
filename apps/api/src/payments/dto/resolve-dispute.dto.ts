import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResolveDisputeDto {
  @ApiProperty({ enum: ['buyer', 'seller'] })
  @IsEnum(['buyer', 'seller'])
  favorOf: 'buyer' | 'seller';

  @ApiProperty({ example: 'Refund granted after review of evidence' })
  @IsString()
  @IsNotEmpty()
  resolution: string;
}
