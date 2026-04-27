import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product, ProductItem, Category } from '../../entities';
import { Admin } from '../../entities/admin/admin.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Product, ProductItem, Category, Admin])],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
