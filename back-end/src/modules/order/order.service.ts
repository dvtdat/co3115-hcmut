import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, ObjectId } from '@mikro-orm/mongodb';
import {
  Order, OrderStatus, OrderDetail, Customer,
  ShoppingCart, CartItem, Product, ProductItem, UserRole,
} from 'src/entities';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { CurrentUserData } from 'src/common/decorators/current-user.decorator';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: EntityRepository<Order>,
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepo: EntityRepository<OrderDetail>,
    @InjectRepository(Customer)
    private readonly customerRepo: EntityRepository<Customer>,
    @InjectRepository(ShoppingCart)
    private readonly cartRepo: EntityRepository<ShoppingCart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: EntityRepository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepo: EntityRepository<Product>,
  ) {}

  /**
   * Create an Order from the current ShoppingCart.
   * Converts CartItems → OrderDetails, deducts stock, clears cart.
   */
  async create(userId: string, dto: CreateOrderDto) {
    const em = this.orderRepo.getEntityManager();

    const customer = await this.customerRepo.findOne(
      { user: new ObjectId(userId) },
      { populate: ['user'] },
    );
    if (!customer) throw new NotFoundException('Customer profile not found');

    // Get cart with items
    const cart = await this.cartRepo.findOne(
      { customer: customer._id },
      { populate: ['cartItems', 'cartItems.productItem', 'cartItems.productItem.product'] },
    );
    if (!cart) throw new NotFoundException('Shopping cart not found');

    const cartItems = await this.cartItemRepo.find(
      { cart: cart._id },
      { populate: ['productItem', 'productItem.product'] },
    );
    if (cartItems.length === 0) {
      throw new BadRequestException('Cart is empty — cannot create order');
    }

    // Calculate total amount from cart items
    let totalAmount = 0;
    for (const item of cartItems) {
      totalAmount += item.productItem.specificPrice * item.quantity;
    }

    // Determine shipping address
    const shippingAddress = dto.shippingAddress || customer.deliveryAccess;

    // Create order
    const order = new Order(totalAmount, dto.receivingMethod, customer);
    if (shippingAddress) {
      // Store as a note since ERD doesn't have shippingAddress on Order
    }
    em.persist(order);

    // Convert CartItems → OrderDetails and update stock
    for (const cartItem of cartItems) {
      const productItem = cartItem.productItem;
      const product = productItem.product;

      // Create OrderDetail — basePrice from Product, unitPrice from ProductItem
      const detail = new OrderDetail(
        product.basePrice,
        productItem.specificPrice,
        order,
        productItem,
      );
      detail.quantity = cartItem.quantity;
      em.persist(detail);

      // Deduct stock from Product
      product.stockQuantity = Math.max(0, product.stockQuantity - cartItem.quantity);

      // Remove cart item
      em.remove(cartItem);
    }

    await em.flush();
    return this.findOne(order._id.toString(), userId);
  }

  /** List current user's orders */
  async findMyOrders(userId: string, pageSize = 10, pageNumber = 1) {
    const customer = await this.customerRepo.findOne({ user: new ObjectId(userId) });
    if (!customer) throw new NotFoundException('Customer profile not found');

    const [data, total] = await this.orderRepo.findAndCount(
      { customer: customer._id, deletedAt: null },
      {
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize,
        orderBy: { orderDate: 'desc' },
        populate: ['orderDetails', 'orderDetails.productItem'],
      },
    );
    return {
      data,
      total,
      pageSize,
      pageNumber,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** List all orders (admin) with optional status and customer filter */
  async findAll(
    pageSize = 10,
    pageNumber = 1,
    status?: OrderStatus,
    customerId?: string,
  ) {
    const filter: Record<string, unknown> = { deletedAt: null };
    if (status) filter.orderStatus = status;
    if (customerId) filter.customer = new ObjectId(customerId);

    const [data, total] = await this.orderRepo.findAndCount(filter, {
      limit: pageSize,
      offset: (pageNumber - 1) * pageSize,
      orderBy: { orderDate: 'desc' },
      populate: ['customer', 'orderDetails', 'orderDetails.productItem'],
    });
    return {
      data,
      total,
      pageSize,
      pageNumber,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** Get a single order by ID */
  async findOne(id: string, userId?: string) {
    const order = await this.orderRepo.findOne(
      { _id: new ObjectId(id), deletedAt: null },
      { populate: ['customer', 'customer.user', 'orderDetails', 'orderDetails.productItem'] },
    );
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  /** Cancel an order (only pending orders) */
  async cancel(id: string, currentUser: CurrentUserData) {
    const order = await this.orderRepo.findOne(
      { _id: new ObjectId(id), deletedAt: null },
      { populate: ['customer', 'customer.user', 'orderDetails', 'orderDetails.productItem'] },
    );
    if (!order) throw new NotFoundException('Order not found');

    // Only order owner or admin can cancel
    const isAdmin = currentUser.role === UserRole.ADMIN;
    if (!isAdmin && order.customer.user._id.toString() !== currentUser._id) {
      throw new ForbiddenException('Access denied');
    }

    if (order.orderStatus !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    order.orderStatus = OrderStatus.CANCELLED;

    // Restore stock for each order detail
    const details = await this.orderDetailRepo.find(
      { order: order._id },
      { populate: ['productItem', 'productItem.product'] },
    );
    for (const detail of details) {
      detail.productItem.product.stockQuantity += detail.quantity;
    }

    await this.orderRepo.getEntityManager().flush();
    return order;
  }

  /** Update order status (admin) */
  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.orderRepo.findOne(
      { _id: new ObjectId(id), deletedAt: null },
      { populate: ['customer', 'orderDetails'] },
    );
    if (!order) throw new NotFoundException('Order not found');

    order.orderStatus = dto.status;
    order.updatedAt = new Date();
    await this.orderRepo.getEntityManager().flush();
    return order;
  }

  /** List orders for a specific user (admin) */
  async findUserOrders(userId: string, pageSize = 10, pageNumber = 1) {
    const customer = await this.customerRepo.findOne({ user: new ObjectId(userId) });
    if (!customer) return { data: [], total: 0, pageSize, pageNumber, totalPages: 0 };

    return this.findAll(pageSize, pageNumber, undefined, customer._id.toString());
  }
}
