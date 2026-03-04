import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';

export class CreateVariantDto {
  @ApiProperty({ example: 'M' })
  @IsString()
  @IsNotEmpty()
  size: string;

  @ApiProperty({ example: 'Rouge' })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  quantity: number;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Wax Ankara 6 yards' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Authentic Ankara wax fabric, 6 yards' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 15000, description: 'Price in FCFA (centimes)' })
  @IsInt()
  @Min(1)
  priceFCFA: number;

  @ApiProperty({ example: 2500, description: 'Price in USD (cents)' })
  @IsInt()
  @Min(1)
  priceUSD: number;

  @ApiPropertyOptional({ enum: ProductStatus, default: ProductStatus.DRAFT })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiProperty({ example: 'uuid-of-category' })
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({ type: [CreateVariantDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  @IsOptional()
  variants?: CreateVariantDto[];
}
