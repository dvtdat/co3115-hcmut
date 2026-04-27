import { Collection, Entity, OneToMany, OneToOne, Property } from '@mikro-orm/core';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../base/base.entity';
import { Customer } from '../customer/customer.entity';
import type { CartItem } from '../cart-item/cart-item.entity';

/**
 * ShoppingCart entity — owned by a Customer (1:1).
 *
 * ERD attributes: sessionID (mapped to _id).
 * Relationships:
 *   - 1:1 → Customer (owns)
 *   - 1:N → CartItem  (contains)
 */
@Entity()
export class ShoppingCart extends BaseEntity {
  @ApiPropertyOptional({ example: 'sess_abc123' })
  @Property({ nullable: true })
  sessionID?: string;

  @OneToOne(() => Customer, { owner: true, unique: true })
  customer!: Customer;

  @OneToMany('CartItem', 'cart')
  cartItems = new Collection<CartItem>(this);

  constructor(customer: Customer) {
    super();
    this.customer = customer;
  }
}
