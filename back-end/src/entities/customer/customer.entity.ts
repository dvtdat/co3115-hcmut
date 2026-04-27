import {
  Collection,
  Entity,
  OneToMany,
  OneToOne,
  Property,
} from '@mikro-orm/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../base/base.entity';
import { User } from '../user/user.entity';
import type { ShoppingCart } from '../shopping-cart/shopping-cart.entity';
import type { Order } from '../order/order.entity';

/**
 * Customer entity — sub-type in the User specialization hierarchy.
 *
 * ERD attributes: fullName, phone, deliveryAccess.
 * Relationships:
 *   - 1:1 → User  (table-per-subclass, shares userID)
 *   - 1:1 → ShoppingCart  (owns)
 *   - 1:N → Order  (places)
 */
@Entity()
export class Customer extends BaseEntity {
  @OneToOne(() => User, { owner: true, unique: true })
  user!: User;

  @ApiProperty({ example: 'Nguyen Van A' })
  @Property()
  fullName!: string;

  @ApiPropertyOptional({ example: '0901234567' })
  @Property({ nullable: true })
  phone?: string;

  @ApiPropertyOptional({ example: '123 Le Loi, Q1, HCM' })
  @Property({ nullable: true })
  deliveryAccess?: string;

  @OneToOne('ShoppingCart', 'customer', { nullable: true })
  shoppingCart?: ShoppingCart;

  @OneToMany('Order', 'customer')
  orders = new Collection<Order>(this);

  constructor(user: User, fullName: string) {
    super();
    this.user = user;
    this.fullName = fullName;
  }
}
