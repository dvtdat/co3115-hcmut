import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../base/base.entity';
import { ShoppingCart } from '../shopping-cart/shopping-cart.entity';
import { ProductItem } from '../product-item/product-item.entity';

/**
 * CartItem entity — line item within a ShoppingCart.
 *
 * ERD attributes: quantity.
 * Relationships:
 *   - N:1 → ShoppingCart (contains)
 *   - N:1 → ProductItem  (refersTo)
 */
@Entity()
export class CartItem extends BaseEntity {
  @ApiProperty({ example: 2 })
  @Property({ type: 'int' })
  quantity!: number;

  @ManyToOne(() => ShoppingCart)
  cart!: ShoppingCart;

  @ManyToOne(() => ProductItem)
  productItem!: ProductItem;

  constructor(quantity: number, cart: ShoppingCart, productItem: ProductItem) {
    super();
    this.quantity = quantity;
    this.cart = cart;
    this.productItem = productItem;
  }
}
