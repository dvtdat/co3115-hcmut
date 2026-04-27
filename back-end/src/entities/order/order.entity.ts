import { Collection, Entity, Enum, ManyToOne, OneToMany, Property } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../base/base.entity';
import { Customer } from '../customer/customer.entity';
import type { OrderDetail } from '../order-detail/order-detail.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum ReceivingMethod {
  DELIVERY = 'delivery',
  PICKUP = 'pickup',
}

/**
 * Order entity — placed by a Customer.
 *
 * ERD attributes: orderID (mapped to _id), orderDate, receivingMethod,
 *                 orderStatus, totalAmount.
 * Relationships:
 *   - N:1 → Customer     (places)
 *   - 1:N → OrderDetail  (consistsOf)
 */
@Entity()
export class Order extends BaseEntity {
  @ApiProperty({ example: '2026-04-25T00:00:00.000Z' })
  @Property({ type: 'date' })
  orderDate: Date = new Date();

  @ApiProperty({ enum: ReceivingMethod, example: ReceivingMethod.DELIVERY })
  @Enum(() => ReceivingMethod)
  receivingMethod!: ReceivingMethod;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING })
  @Enum(() => OrderStatus)
  orderStatus: OrderStatus = OrderStatus.PENDING;

  @ApiProperty({ example: 105980000 })
  @Property({ type: 'double' })
  totalAmount!: number;

  @ManyToOne(() => Customer)
  customer!: Customer;

  @OneToMany('OrderDetail', 'order')
  orderDetails = new Collection<OrderDetail>(this);

  constructor(
    totalAmount: number,
    receivingMethod: ReceivingMethod,
    customer: Customer,
  ) {
    super();
    this.totalAmount = totalAmount;
    this.receivingMethod = receivingMethod;
    this.customer = customer;
  }
}
