import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  Property,
} from '@mikro-orm/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../base/base.entity';
import { Category } from '../category/category.entity';
import { Admin } from '../admin/admin.entity';
import type { ProductItem } from '../product-item/product-item.entity';

/**
 * Product entity — represents a base product definition.
 *
 * ERD attributes: productID (mapped to _id), productName, description,
 *                 basePrice, stockQuantity, defaultImage.
 * Relationships:
 *   - N:1 → Category  (contains)
 *   - N:1 → Admin     (manages)
 *   - 1:N → ProductItem (hasUnits)
 */
@Entity()
export class Product extends BaseEntity {
  @ApiProperty({ example: 'MacBook Pro 14"' })
  @Property()
  productName!: string;

  @ApiPropertyOptional({ example: 'Apple M3 Pro chip, 18GB RAM' })
  @Property({ nullable: true })
  description?: string;

  @ApiProperty({ example: 49990000 })
  @Property({ type: 'double' })
  basePrice!: number;

  @ApiProperty({ example: 100 })
  @Property({ type: 'int', default: 0 })
  stockQuantity = 0;

  @ApiPropertyOptional({ example: 'https://example.com/macbook.jpg' })
  @Property({ nullable: true })
  defaultImage?: string;

  @ManyToOne(() => Category)
  category!: Category;

  @ManyToOne(() => Admin)
  managedBy!: Admin;

  @OneToMany('ProductItem', 'product')
  productItems = new Collection<ProductItem>(this);

  constructor(
    productName: string,
    basePrice: number,
    category: Category,
    managedBy: Admin,
  ) {
    super();
    this.productName = productName;
    this.basePrice = basePrice;
    this.category = category;
    this.managedBy = managedBy;
  }
}
