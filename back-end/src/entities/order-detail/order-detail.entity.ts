import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../base/base.entity';
import { Order } from '../order/order.entity';
import { ProductItem } from '../product-item/product-item.entity';

/**
 * OrderDetail entity — line item within an Order.
 *
 * ERD attributes: basePrice, unitPrice.
 * Relationships:
 *   - N:1 → Order       (consistsOf)
 *   - N:1 → ProductItem (belongsTo)
 */
@Entity()
export class OrderDetail extends BaseEntity {
  @ApiProperty({ example: 49990000 })
  @Property({ type: 'double' })
  basePrice!: number;

  @ApiProperty({ example: 52990000 })
  @Property({ type: 'double' })
  unitPrice!: number;

  @ApiProperty({ example: 1 })
  @Property({ type: 'int', default: 1 })
  quantity = 1;

  @ManyToOne(() => Order)
  order!: Order;

  @ManyToOne(() => ProductItem)
  productItem!: ProductItem;

  constructor(
    basePrice: number,
    unitPrice: number,
    order: Order,
    productItem: ProductItem,
  ) {
    super();
    this.basePrice = basePrice;
    this.unitPrice = unitPrice;
    this.order = order;
    this.productItem = productItem;
  }
}
