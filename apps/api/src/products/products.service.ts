import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from './cloudinary.service';
import { CreateProductDto, UpdateProductDto, ProductFilterDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // ── Create ──────────────────────────────────────────────────────────

  async create(sellerId: string, dto: CreateProductDto) {
    const { variants, ...productData } = dto;

    return this.prisma.product.create({
      data: {
        ...productData,
        sellerId,
        variants: variants?.length
          ? { createMany: { data: variants } }
          : undefined,
      },
      include: { variants: true, images: true, category: true },
    });
  }

  // ── Upload Images ───────────────────────────────────────────────────

  async uploadImages(
    productId: string,
    sellerId: string,
    files: Express.Multer.File[],
  ) {
    const product = await this.findOneOrFail(productId);
    this.assertOwner(product.sellerId, sellerId);

    const currentImageCount = await this.prisma.productImage.count({
      where: { productId },
    });

    if (currentImageCount + files.length > 10) {
      throw new BadRequestException(
        `Maximum 10 images allowed. Currently ${currentImageCount}, trying to add ${files.length}.`,
      );
    }

    const uploads = await Promise.all(
      files.map((file) =>
        this.cloudinary.uploadImage(file, `cowri/products/${productId}`),
      ),
    );

    const images = await this.prisma.$transaction(
      uploads.map((upload, index) =>
        this.prisma.productImage.create({
          data: {
            productId,
            url: upload.url,
            publicId: upload.publicId,
            position: currentImageCount + index,
          },
        }),
      ),
    );

    return images;
  }

  // ── Delete Image ────────────────────────────────────────────────────

  async deleteImage(imageId: string, sellerId: string) {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
      include: { product: { select: { sellerId: true } } },
    });

    if (!image) throw new NotFoundException('Image not found');
    this.assertOwner(image.product.sellerId, sellerId);

    await this.cloudinary.deleteImage(image.publicId);
    await this.prisma.productImage.delete({ where: { id: imageId } });

    return { message: 'Image deleted' };
  }

  // ── Find All (cursor-based pagination + filters) ────────────────────

  async findAll(filters: ProductFilterDto) {
    const {
      cursor,
      take = 20,
      priceMinFCFA,
      priceMaxFCFA,
      categoryId,
      sellerCountry,
      status,
      search,
    } = filters;

    const where: Prisma.ProductWhereInput = {
      ...(status && { status }),
      ...(categoryId && { categoryId }),
      ...(sellerCountry && { seller: { country: sellerCountry } }),
      ...(priceMinFCFA !== undefined && { priceFCFA: { gte: priceMinFCFA } }),
      ...(priceMaxFCFA !== undefined && {
        priceFCFA: { ...((where as any)?.priceFCFA || {}), lte: priceMaxFCFA },
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    // Handle combined min+max price filter
    if (priceMinFCFA !== undefined && priceMaxFCFA !== undefined) {
      where.priceFCFA = { gte: priceMinFCFA, lte: priceMaxFCFA };
    }

    const products = await this.prisma.product.findMany({
      where,
      take: take + 1, // fetch one extra to determine if there's a next page
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { position: 'asc' }, take: 1 },
        category: true,
        seller: { select: { id: true, firstName: true, country: true } },
        _count: { select: { variants: true } },
      },
    });

    const hasNextPage = products.length > take;
    const items = hasNextPage ? products.slice(0, take) : products;
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;

    return { items, nextCursor, hasNextPage };
  }

  // ── Find One ────────────────────────────────────────────────────────

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: 'asc' } },
        variants: true,
        category: true,
        seller: { select: { id: true, firstName: true, lastName: true, country: true } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  // ── Update ──────────────────────────────────────────────────────────

  async update(id: string, sellerId: string, dto: UpdateProductDto) {
    const product = await this.findOneOrFail(id);
    this.assertOwner(product.sellerId, sellerId);

    const { variants, ...productData } = dto;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        ...(variants && {
          variants: {
            deleteMany: {},
            createMany: { data: variants },
          },
        }),
      },
      include: { variants: true, images: true, category: true },
    });
  }

  // ── Delete ──────────────────────────────────────────────────────────

  async remove(id: string, sellerId: string) {
    const product = await this.findOneOrFail(id);
    this.assertOwner(product.sellerId, sellerId);

    // Delete all Cloudinary images
    const images = await this.prisma.productImage.findMany({
      where: { productId: id },
    });
    await Promise.all(
      images.map((img) => this.cloudinary.deleteImage(img.publicId)),
    );

    await this.prisma.product.delete({ where: { id } });

    return { message: 'Product deleted' };
  }

  // ── Private helpers ─────────────────────────────────────────────────

  private async findOneOrFail(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  private assertOwner(ownerId: string, currentUserId: string) {
    if (ownerId !== currentUserId) {
      throw new ForbiddenException('You do not own this product');
    }
  }
}
