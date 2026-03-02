import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Request } from "express";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Roles, RolesGuard } from "../auth/guards/roles.guard";
import { CreateProductDto, UpdateProductDto, QueryProductsDto } from "./dto";
import { ProductsService } from "./products.service";

@Controller("products")
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SELLER", "ADMIN")
  @UseInterceptors(FilesInterceptor("images", 10))
  create(
    @Req() req: Request,
    @Body() dto: CreateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.products.create((req.user as any).id, dto, images ?? []);
  }

  @Get()
  findAll(@Query() query: QueryProductsDto) {
    return this.products.findAll(query);
  }

  @Get("by-slug/:slug")
  findBySlug(@Param("slug") slug: string) {
    return this.products.findBySlug(slug);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.products.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SELLER", "ADMIN")
  @UseInterceptors(FilesInterceptor("images", 10))
  update(
    @Param("id") id: string,
    @Req() req: Request,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.products.update(id, (req.user as any).id, dto, images);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SELLER", "ADMIN")
  remove(@Param("id") id: string, @Req() req: Request) {
    return this.products.remove(id, (req.user as any).id);
  }

  @Delete(":id/images")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SELLER", "ADMIN")
  removeImage(
    @Param("id") id: string,
    @Req() req: Request,
    @Body("imageUrl") imageUrl: string,
  ) {
    return this.products.removeImage(id, (req.user as any).id, imageUrl);
  }
}
