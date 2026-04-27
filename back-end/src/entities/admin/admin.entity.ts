import {
  Collection,
  Entity,
  Enum,
  OneToMany,
  OneToOne,
} from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../base/base.entity';
import { User } from '../user/user.entity';
import type { Product } from '../product/product.entity';

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  PRODUCT_MANAGER = 'product_manager',
  ORDER_MANAGER = 'order_manager',
}

/**
 * Admin entity — sub-type in the User specialization hierarchy.
 *
 * ERD attributes: adminRole.
 * Relationships:
 *   - 1:1 → User  (table-per-subclass, shares userID)
 *   - 1:N → Product  (manages)
 */
@Entity()
export class Admin extends BaseEntity {
  @OneToOne(() => User, { owner: true, unique: true })
  user!: User;

  @ApiProperty({ enum: AdminRole, example: AdminRole.PRODUCT_MANAGER })
  @Enum(() => AdminRole)
  adminRole!: AdminRole;

  @OneToMany('Product', 'managedBy')
  products = new Collection<Product>(this);

  constructor(user: User, adminRole: AdminRole) {
    super();
    this.user = user;
    this.adminRole = adminRole;
  }
}
