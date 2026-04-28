import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole, Order, OrderStatus } from 'src/entities';
import { RoleGuard } from 'src/common/guards/role.guard';
import {
  CurrentUser,
  CurrentUserData,
} from 'src/common/decorators/current-user.decorator';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create order from current cart' })
  @ApiCreatedResponse({ type: Order })
  create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateOrderDto) {
    return this.orderService.create(user._id, dto);
  }

  @Get('me')
  @ApiOperation({ summary: "List current user's orders" })
  @ApiOkResponse({
    schema: {
      properties: {
        data: { type: 'array', items: { $ref: getSchemaPath(Order) } },
        total: { type: 'number' },
        pageSize: { type: 'number' },
        pageNumber: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  findMyOrders(
    @CurrentUser() user: CurrentUserData,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 10,
    @Query('pageNumber', new ParseIntPipe({ optional: true })) pageNumber = 1,
  ) {
    return this.orderService.findMyOrders(user._id, pageSize, pageNumber);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get()
  @ApiOperation({ summary: 'List all orders (admin)' })
  @ApiOkResponse({
    schema: {
      properties: {
        data: { type: 'array', items: { $ref: getSchemaPath(Order) } },
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
    @Query('status') status?: OrderStatus,
  ) {
    return this.orderService.findAll(pageSize, pageNumber, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiOkResponse({ type: Order })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.orderService.findOne(id, user._id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel an order (pending only)' })
  @ApiOkResponse({ type: Order })
  cancel(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.orderService.cancel(id, user);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (admin)' })
  @ApiOkResponse({ type: Order })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orderService.updateStatus(id, dto);
  }
}
