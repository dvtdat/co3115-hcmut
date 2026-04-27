import { Entity, Enum, Property } from '@mikro-orm/core';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../base/base.entity';

export enum UserRole {
  GUEST = 'guest',
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

/**
 * Base User entity — center of the specialization hierarchy.
 *
 * ERD attributes: userID (mapped to _id), email, passwordHash.
 * The disjoint constraint (Customer | Admin) is enforced via the
 * `role` discriminator column at the application level.
 */
@Entity()
export class User extends BaseEntity {
  @ApiProperty({ example: 'user@example.com' })
  @Property({ unique: true })
  email!: string;

  @ApiHideProperty()
  @Property()
  password!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CUSTOMER })
  @Enum(() => UserRole)
  role!: UserRole;

  @ApiProperty({ example: true })
  @Property({ default: true })
  isActive = true;

  constructor(email: string, password: string, role: UserRole = UserRole.CUSTOMER) {
    super();
    this.email = email;
    this.password = password;
    this.role = role;
  }
}
