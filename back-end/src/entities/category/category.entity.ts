import { Collection, Entity, OneToMany, Property } from '@mikro-orm/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../base/base.entity';
import type { Product } from '../product/product.entity';

/**
 * Category entity.
 *
 * ERD attributes: categoryID (mapped to _id), categoryName, description.
 * Relationships:
 *   - 1:N → Product  (contains)
 */
@Entity()
export class Category extends BaseEntity {
  @ApiProperty({ example: 'Laptops' })
  @Property({ unique: true })
  categoryName!: string;

  @ApiPropertyOptional({ example: 'All types of portable computers' })
  @Property({ nullable: true })
  description?: string;

  @OneToMany('Product', 'category')
  products = new Collection<Product>(this);

  constructor(categoryName: string, description?: string) {
    super();
    this.categoryName = categoryName;
    this.description = description;
  }
}
