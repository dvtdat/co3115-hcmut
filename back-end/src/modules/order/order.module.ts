import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import {
  Order, OrderDetail, Customer,
  ShoppingCart, CartItem, Product,
} from '../../entities';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Order, OrderDetail, Customer,
      ShoppingCart, CartItem, Product,
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
