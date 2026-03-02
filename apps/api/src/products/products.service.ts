import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import slugify from "slugify";

import { PrismaService } from "../prisma/prisma.service";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { CreateProductDto, UpdateProductDto, QueryProductsDto } from "./dto";

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // ── Create ─────────────────────────────────────────────────

  async create(
    sellerId: string,
    dto: CreateProductDto,
    images: Express.Multer.File[],
  ) {
    const slug = await this.generateUniqueSlug(dto.name);
    const imageUrls = images.length
      ? await this.cloudinary.uploadImages(images, "products")
      : [];

    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        priceFcfa: dto.priceFcfa,
        priceUsd: dto.priceUsd,
        compareAt: dto.compareAt,
        sku: dto.sku,
        stock: dto.stock,
        images: imageUrls,
        status: dto.status,
        sellerId,
        categoryId: dto.categoryId,
        variants: dto.variants
          ? { createMany: { data: dto.variants } }
          : undefined,
      },
      include: { variants: true, category: true },
    });
  }

  // ── Find All (cursor-based pagination + filters) ───────────

  async findAll(query: QueryProductsDto) {
    const take = query.take ?? 20;

    const where: Prisma.ProductWhereInput = {
      status: query.status ?? "ACTIVE",
    };

    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.priceMin !== undefined || query.priceMax !== undefined) {
      where.priceFcfa = {};
      if (query.priceMin !== undefined) where.priceFcfa.gte = query.priceMin;
      if (query.priceMax !== undefined) where.priceFcfa.lte = query.priceMax;
    }
    if (query.sellerCountry) {
      where.seller = { country: query.sellerCountry };
    }
    if (query.ratingMin) {
      where.reviews = { some: { rating: { gte: query.ratingMin } } };
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const products = await this.prisma.product.findMany({
      where,
      take: take + 1,
      ...(query.cursor
        ? { cursor: { id: query.cursor }, skip: 1 }
        : {}),
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            country: true,
          },
        },
        variants: true,
        _count: { select: { reviews: true } },
      },
    });

    const hasNextPage = products.length > take;
    if (hasNextPage) products.pop();

    return {
      data: products,
      nextCursor: hasNextPage ? products[products.length - 1].id : null,
      hasNextPage,
    };
  }

  // ── Find One ───────────────────────────────────────────────

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            country: true,
          },
        },
        variants: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  // ── Find By Slug ───────────────────────────────────────────

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            country: true,
          },
        },
        variants: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  // ── Update ─────────────────────────────────────────────────

  async update(
    id: string,
    sellerId: string,
    dto: UpdateProductDto,
    images?: Express.Multer.File[],
  ) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException("Product not found");
    if (product.sellerId !== sellerId) {
      throw new ForbiddenException("You can only update your own products");
    }

    let imageUrls: string[] | undefined;
    if (images?.length) {
      const newUrls = await this.cloudinary.uploadImages(images, "products");
      imageUrls = [...product.images, ...newUrls].slice(0, 10);
    }

    // If variants are provided, replace all existing ones
    if (dto.variants) {
      await this.prisma.productVariant.deleteMany({
        where: { productId: id },
      });
    }

    const slug =
      dto.name && dto.name !== product.name
        ? await this.generateUniqueSlug(dto.name)
        : undefined;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
        slug,
        variants: dto.variants
          ? { createMany: { data: dto.variants } }
          : undefined,
        images: imageUrls ?? undefined,
      },
      include: { variants: true, category: true },
    });
  }

  // ── Delete ─────────────────────────────────────────────────

  async remove(id: string, sellerId: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException("Product not found");
    if (product.sellerId !== sellerId) {
      throw new ForbiddenException("You can only delete your own products");
    }

    await this.prisma.product.delete({ where: { id } });
    return { message: "Product deleted" };
  }

  // ── Delete Image ───────────────────────────────────────────

  async removeImage(productId: string, sellerId: string, imageUrl: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException("Product not found");
    if (product.sellerId !== sellerId) {
      throw new ForbiddenException("You can only update your own products");
    }

    const updatedImages = product.images.filter((img) => img !== imageUrl);

    return this.prisma.product.update({
      where: { id: productId },
      data: { images: updatedImages },
    });
  }

  // ── Helpers ────────────────────────────────────────────────

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = slugify(name, { lower: true, strict: true });
    let slug = base;
    let counter = 1;

    while (await this.prisma.product.findUnique({ where: { slug } })) {
      slug = `${base}-${counter}`;
      counter++;
    }

    return slug;
  }
}
