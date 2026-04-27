import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from 'src/common/decorators/current-user.decorator';
import { ShoppingCart } from 'src/entities';

@ApiTags('carts')
@Controller('carts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get or create the current user cart' })
  @ApiOkResponse({ type: ShoppingCart })
  getCart(@CurrentUser() user: CurrentUserData) {
    return this.cartService.getCart(user._id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart (increments if already exists)' })
  @ApiOkResponse({ type: ShoppingCart })
  addItem(@CurrentUser() user: CurrentUserData, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(user._id, dto);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiOkResponse({ type: ShoppingCart })
  updateItem(
    @CurrentUser() user: CurrentUserData,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user._id, itemId, dto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove an item from cart' })
  @ApiOkResponse({ type: ShoppingCart })
  removeItem(
    @CurrentUser() user: CurrentUserData,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeItem(user._id, itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all items from cart' })
  @ApiOkResponse({ type: ShoppingCart })
  clearCart(@CurrentUser() user: CurrentUserData) {
    return this.cartService.clearCart(user._id);
  }
}
