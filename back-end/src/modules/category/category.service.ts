import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, ObjectId } from '@mikro-orm/mongodb';
import { Category } from 'src/entities';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: EntityRepository<Category>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const category = new Category(dto.categoryName, dto.description);
    await this.categoryRepo.getEntityManager().persistAndFlush(category);
    return category;
  }

  async findAll(pageSize = 10, pageNumber = 1) {
    const [data, total] = await this.categoryRepo.findAndCount(
      { deletedAt: null },
      {
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize,
        orderBy: { _id: 'asc' },
      },
    );
    return {
      data,
      total,
      pageSize,
      pageNumber,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string) {
    const category = await this.categoryRepo.findOne({
      _id: new ObjectId(id),
      deletedAt: null,
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    if (dto.categoryName) category.categoryName = dto.categoryName;
    if (dto.description !== undefined) category.description = dto.description;
    category.updatedAt = new Date();
    await this.categoryRepo.getEntityManager().flush();
    return category;
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    category.deletedAt = new Date();
    await this.categoryRepo.getEntityManager().flush();
    return { message: 'Category deleted successfully' };
  }
}
