import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, ObjectId } from '@mikro-orm/mongodb';
import { Product, Category, ProductItem, ProductItemStatus } from 'src/entities';
import { Admin } from 'src/entities/admin/admin.entity';
import {
  CreateProductDto,
  UpdateProductDto,
  CreateProductItemDto,
  UpdateProductItemDto,
} from './dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: EntityRepository<Product>,
    @InjectRepository(ProductItem)
    private readonly productItemRepo: EntityRepository<ProductItem>,
    @InjectRepository(Category)
    private readonly categoryRepo: EntityRepository<Category>,
    @InjectRepository(Admin)
    private readonly adminRepo: EntityRepository<Admin>,
  ) {}

  // ─── Product CRUD ────────────────────────────────

  async create(dto: CreateProductDto, userId: string) {
    const em = this.productRepo.getEntityManager();

    const category = await this.categoryRepo.findOne({
      _id: new ObjectId(dto.categoryId),
      deletedAt: null,
    });
    if (!category) throw new NotFoundException('Category not found');

    const admin = await this.adminRepo.findOne({ user: new ObjectId(userId) });
    if (!admin) throw new NotFoundException('Admin profile not found');

    const product = new Product(dto.productName, dto.basePrice, category, admin);
    product.description = dto.description;
    product.stockQuantity = dto.stockQuantity;
    product.defaultImage = dto.defaultImage;

    const defaultItem = new ProductItem(dto.basePrice, product);
    defaultItem.imageURL = dto.defaultImage;
    defaultItem.status = ProductItemStatus.AVAILABLE;

    em.persist(product);
    em.persist(defaultItem);
    await em.flush();
    return product;
  }

  async findAll(
    pageSize = 10,
    pageNumber = 1,
    categoryId?: string,
    search?: string,
    sort?: string,
  ) {
    const filter: Record<string, unknown> = { deletedAt: null };
    if (categoryId) filter.category = new ObjectId(categoryId);
    if (search) filter.productName = { $regex: search, $options: 'i' };

    // Determine sort order (FR-1.1)
    let orderBy: Record<string, 'asc' | 'desc'>;
    switch (sort) {
      case 'price_asc':
        orderBy = { basePrice: 'asc' };
        break;
      case 'price_desc':
        orderBy = { basePrice: 'desc' };
        break;
      case 'name_asc':
        orderBy = { productName: 'asc' };
        break;
      case 'name_desc':
        orderBy = { productName: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [data, total] = await this.productRepo.findAndCount(filter, {
      limit: pageSize,
      offset: (pageNumber - 1) * pageSize,
      orderBy,
      populate: ['category'],
    });
    return {
      data,
      total,
      pageSize,
      pageNumber,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string) {
    const product = await this.productRepo.findOne(
      { _id: new ObjectId(id), deletedAt: null },
      { populate: ['category', 'productItems'] },
    );
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const em = this.productRepo.getEntityManager();
    const product = await this.findOne(id);

    if (dto.categoryId) {
      const category = await this.categoryRepo.findOne({
        _id: new ObjectId(dto.categoryId),
        deletedAt: null,
      });
      if (!category) throw new NotFoundException('Category not found');
      product.category = category;
    }

    if (dto.productName) product.productName = dto.productName;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.basePrice !== undefined) product.basePrice = dto.basePrice;
    if (dto.stockQuantity !== undefined) product.stockQuantity = dto.stockQuantity;
    if (dto.defaultImage !== undefined) product.defaultImage = dto.defaultImage;
    product.updatedAt = new Date();

    await em.flush();
    return product;
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    product.deletedAt = new Date();
    await this.productRepo.getEntityManager().flush();
    return { message: 'Product deleted successfully' };
  }

  // ─── ProductItem CRUD ────────────────────────────

  async createItem(productId: string, dto: CreateProductItemDto) {
    const em = this.productItemRepo.getEntityManager();
    const product = await this.findOne(productId);

    const item = new ProductItem(dto.specificPrice, product);
    item.imageURL = dto.imageURL;
    if (dto.status) item.status = dto.status;

    em.persist(item);
    await em.flush();
    return item;
  }

  async updateItem(itemId: string, dto: UpdateProductItemDto) {
    const em = this.productItemRepo.getEntityManager();
    const item = await this.productItemRepo.findOne({
      _id: new ObjectId(itemId),
      deletedAt: null,
    });
    if (!item) throw new NotFoundException('Product item not found');

    if (dto.specificPrice !== undefined) item.specificPrice = dto.specificPrice;
    if (dto.imageURL !== undefined) item.imageURL = dto.imageURL;
    if (dto.status) item.status = dto.status;
    item.updatedAt = new Date();

    await em.flush();
    return item;
  }

  async removeItem(itemId: string) {
    const item = await this.productItemRepo.findOne({
      _id: new ObjectId(itemId),
      deletedAt: null,
    });
    if (!item) throw new NotFoundException('Product item not found');
    item.deletedAt = new Date();
    await this.productItemRepo.getEntityManager().flush();
    return { message: 'Product item deleted successfully' };
  }

  async findAvailableItems(productId: string) {
    return this.productItemRepo.find({
      product: new ObjectId(productId),
      status: ProductItemStatus.AVAILABLE,
      deletedAt: null,
    });
  }
}
