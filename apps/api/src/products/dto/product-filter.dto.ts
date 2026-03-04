import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';

export class ProductFilterDto {
  @ApiPropertyOptional({ description: 'Cursor for pagination (product ID)' })
  @IsUUID()
  @IsOptional()
  cursor?: string;

  @ApiPropertyOptional({ default: 20 })
  @IsInt()
  @Min(1)
  @IsOptional()
  take?: number = 20;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  priceMinFCFA?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  priceMaxFCFA?: number;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by seller country code (e.g. CI, SN)' })
  @IsString()
  @IsOptional()
  sellerCountry?: string;

  @ApiPropertyOptional({ enum: ProductStatus })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiPropertyOptional({ description: 'Search keyword in title/description' })
  @IsString()
  @IsOptional()
  search?: string;
}
