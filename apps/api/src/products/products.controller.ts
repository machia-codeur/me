import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAccessGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductFilterDto } from './dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product' })
  create(
    @CurrentUser('id') sellerId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(sellerId, dto);
  }

  @Post(':id/images')
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload images for a product (max 10 total)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadImages(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') sellerId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productsService.uploadImages(id, sellerId, files);
  }

  @Delete('images/:imageId')
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product image' })
  deleteImage(
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.productsService.deleteImage(imageId, sellerId);
  }

  @Get()
  @ApiOperation({ summary: 'List products with cursor-based pagination and filters' })
  findAll(@Query() filters: ProductFilterDto) {
    return this.productsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product (owner only)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') sellerId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, sellerId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product (owner only)' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.productsService.remove(id, sellerId);
  }
}
