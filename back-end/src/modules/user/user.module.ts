import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, Customer } from '../../entities';
import { ShoppingCart } from '../../entities/shopping-cart/shopping-cart.entity';

@Module({
  imports: [MikroOrmModule.forFeature([User, Customer, ShoppingCart])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
