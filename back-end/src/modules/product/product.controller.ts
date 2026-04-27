import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiOkResponse,
  ApiOperation, ApiTags, getSchemaPath,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import {
  CreateProductDto, UpdateProductDto,
  CreateProductItemDto, UpdateProductItemDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole, Product, ProductItem } from 'src/entities';
import { RoleGuard } from 'src/common/guards/role.guard';
import { CurrentUser, CurrentUserData } from 'src/common/decorators/current-user.decorator';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ─── Product endpoints ─────────────────────────

  @Get()
  @ApiOperation({ summary: 'List all products with optional category filter' })
  @ApiOkResponse({
    schema: {
      properties: {
        data: { type: 'array', items: { $ref: getSchemaPath(Product) } },
        total: { type: 'number' },
        pageSize: { type: 'number' },
        pageNumber: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  findAll(
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 10,
    @Query('pageNumber', new ParseIntPipe({ optional: true })) pageNumber = 1,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
  ) {
    return this.productService.findAll(pageSize, pageNumber, categoryId, search, sort);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID (includes product items)' })
  @ApiOkResponse({ type: Product })
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product (admin)' })
  @ApiCreatedResponse({ type: Product })
  create(
    @Body() dto: CreateProductDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.productService.create(dto, currentUser._id);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product (admin)' })
  @ApiOkResponse({ type: Product })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product (admin)' })
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }

  // ─── ProductItem endpoints ─────────────────────

  @Get(':id/items')
  @ApiOperation({ summary: 'List available items for a product' })
  @ApiOkResponse({ type: [ProductItem] })
  findItems(@Param('id') id: string) {
    return this.productService.findAvailableItems(id);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post(':id/items')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a product item (admin)' })
  @ApiCreatedResponse({ type: ProductItem })
  createItem(@Param('id') id: string, @Body() dto: CreateProductItemDto) {
    return this.productService.createItem(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Patch('items/:itemId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product item (admin)' })
  @ApiOkResponse({ type: ProductItem })
  updateItem(@Param('itemId') itemId: string, @Body() dto: UpdateProductItemDto) {
    return this.productService.updateItem(itemId, dto);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Delete('items/:itemId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product item (admin)' })
  removeItem(@Param('itemId') itemId: string) {
    return this.productService.removeItem(itemId);
  }
}
