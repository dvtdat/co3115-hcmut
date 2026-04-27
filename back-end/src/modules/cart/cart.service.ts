import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, ObjectId } from '@mikro-orm/mongodb';
import { ShoppingCart, CartItem, ProductItem, Customer, ProductItemStatus } from 'src/entities';
import { AddCartItemDto, UpdateCartItemDto } from './dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(ShoppingCart)
    private readonly cartRepo: EntityRepository<ShoppingCart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: EntityRepository<CartItem>,
    @InjectRepository(ProductItem)
    private readonly productItemRepo: EntityRepository<ProductItem>,
    @InjectRepository(Customer)
    private readonly customerRepo: EntityRepository<Customer>,
  ) {}

  private async findCustomer(userId: string) {
    const customer = await this.customerRepo.findOne({ user: new ObjectId(userId) });
    if (!customer) throw new NotFoundException('Customer profile not found');
    return customer;
  }

  private async findOrCreateCart(customer: Customer): Promise<ShoppingCart> {
    const existing = await this.cartRepo.findOne({ customer: customer._id });
    if (existing) return existing;

    const cart = new ShoppingCart(customer);
    const em = this.cartRepo.getEntityManager();
    em.persist(cart);
    await em.flush();
    return cart;
  }

  /** Get or create the shopping cart for the current user */
  async getCart(userId: string) {
    const customer = await this.findCustomer(userId);
    const cart = await this.findOrCreateCart(customer);

    // Load cart items with their product item references
    const cartItems = await this.cartItemRepo.find(
      { cart: cart._id },
      { populate: ['productItem', 'productItem.product'] },
    );

    return { ...cart, cartItems };
  }

  /** Add a ProductItem to the cart (increments quantity if already exists) */
  async addItem(userId: string, dto: AddCartItemDto) {
    const em = this.cartRepo.getEntityManager();
    const customer = await this.findCustomer(userId);
    const cart = await this.findOrCreateCart(customer);

    const productItem = await this.productItemRepo.findOne({
      _id: new ObjectId(dto.productItemId),
      status: ProductItemStatus.AVAILABLE,
      deletedAt: null,
    });
    if (!productItem) throw new NotFoundException('Product item not found or unavailable');

    const existing = await this.cartItemRepo.findOne({
      cart: cart._id,
      productItem: productItem._id,
    });

    // Verify stock is sufficient (FR-3.4 / §6.4.4)
    const productRef = await this.productItemRepo.findOne(
      { _id: productItem._id },
      { populate: ['product'] },
    );
    const totalQty = (existing?.quantity ?? 0) + dto.quantity;
    if (productRef && productRef.product.stockQuantity < totalQty) {
      throw new BadRequestException('Requested quantity exceeds available stock');
    }

    if (existing) {
      existing.quantity += dto.quantity;
      existing.updatedAt = new Date();
    } else {
      const cartItem = new CartItem(dto.quantity, cart, productItem);
      em.persist(cartItem);
    }

    await em.flush();
    return this.getCart(userId);
  }

  /** Update a cart item's quantity */
  async updateItem(userId: string, cartItemId: string, dto: UpdateCartItemDto) {
    const customer = await this.findCustomer(userId);
    const cart = await this.findOrCreateCart(customer);

    const cartItem = await this.cartItemRepo.findOne({
      _id: new ObjectId(cartItemId),
      cart: cart._id,
    });
    if (!cartItem) throw new NotFoundException('Cart item not found');

    cartItem.quantity = dto.quantity;
    cartItem.updatedAt = new Date();
    await this.cartRepo.getEntityManager().flush();

    return this.getCart(userId);
  }

  /** Remove a specific item from the cart */
  async removeItem(userId: string, cartItemId: string) {
    const customer = await this.findCustomer(userId);
    const cart = await this.findOrCreateCart(customer);

    const cartItem = await this.cartItemRepo.findOne({
      _id: new ObjectId(cartItemId),
      cart: cart._id,
    });
    if (!cartItem) throw new NotFoundException('Cart item not found');

    const em = this.cartRepo.getEntityManager();
    em.remove(cartItem);
    await em.flush();

    return this.getCart(userId);
  }

  /** Clear all items from the cart */
  async clearCart(userId: string) {
    const customer = await this.findCustomer(userId);
    const cart = await this.findOrCreateCart(customer);

    const items = await this.cartItemRepo.find({ cart: cart._id });
    const em = this.cartRepo.getEntityManager();
    for (const item of items) {
      em.remove(item);
    }
    await em.flush();

    return this.getCart(userId);
  }
}
