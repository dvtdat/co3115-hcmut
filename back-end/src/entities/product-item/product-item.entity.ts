import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../base/base.entity';
import { Product } from '../product/product.entity';

export enum ProductItemStatus {
  AVAILABLE = 'available',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}

/**
 * ProductItem entity — a concrete variation / sellable unit of a Product.
 *
 * ERD attributes: itemID (mapped to _id), imageURL, status, specificPrice.
 * Relationships:
 *   - N:1 → Product  (hasUnits / belongsTo)
 */
@Entity()
export class ProductItem extends BaseEntity {
  @ApiPropertyOptional({ example: 'https://example.com/macbook-silver.jpg' })
  @Property({ nullable: true })
  imageURL?: string;

  @ApiProperty({ enum: ProductItemStatus, example: ProductItemStatus.AVAILABLE })
  @Enum(() => ProductItemStatus)
  status: ProductItemStatus = ProductItemStatus.AVAILABLE;

  @ApiProperty({ example: 52990000 })
  @Property({ type: 'double' })
  specificPrice!: number;

  @ManyToOne(() => Product)
  product!: Product;

  constructor(specificPrice: number, product: Product) {
    super();
    this.specificPrice = specificPrice;
    this.product = product;
  }
}
