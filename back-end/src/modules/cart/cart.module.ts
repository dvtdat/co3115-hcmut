import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { ShoppingCart, CartItem, ProductItem, Customer, User } from '../../entities';

@Module({
  imports: [MikroOrmModule.forFeature([ShoppingCart, CartItem, ProductItem, Customer, User])],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
