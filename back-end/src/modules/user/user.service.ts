import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, UpdateUserStatusDto } from './dto';
import { EntityRepository, ObjectId } from '@mikro-orm/mongodb';
import { User, UserRole, Customer } from 'src/entities';
import { ShoppingCart } from 'src/entities/shopping-cart/shopping-cart.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { utils } from 'src/common/utils';
import { CurrentUserData } from 'src/common/decorators/current-user.decorator';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @InjectRepository(Customer)
    private readonly customerRepository: EntityRepository<Customer>,
    @InjectRepository(ShoppingCart)
    private readonly shoppingCartRepository: EntityRepository<ShoppingCart>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      email: createUserDto.email,
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const em = this.userRepository.getEntityManager();

    const hashedPassword = await utils.hashPassword(createUserDto.password);
    const user = new User(createUserDto.email, hashedPassword, UserRole.CUSTOMER);
    em.persist(user);

    // Create the Customer sub-entity
    const customer = new Customer(user, createUserDto.fullName);
    customer.phone = createUserDto.phone;
    customer.deliveryAccess = createUserDto.deliveryAccess;
    em.persist(customer);

    // Create a ShoppingCart for the customer (1:1)
    const cart = new ShoppingCart(customer);
    em.persist(cart);

    await em.flush();

    return { user, customer };
  }

  async findAll(pageSize = 10, pageNumber = 1) {
    const [data, total] = await this.userRepository.findAndCount(
      { deletedAt: null },
      {
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize,
        orderBy: { _id: 'asc' },
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

  async findByEmail(email: string) {
    return this.userRepository.findOne({ email, deletedAt: null });
  }

  async findById(id: string) {
    return this.userRepository.findOne({
      _id: new ObjectId(id),
      deletedAt: null,
    });
  }

  async getMe(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      _id: new ObjectId(userId),
      deletedAt: null,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: CurrentUserData,
  ) {
    const isOwner = currentUser._id === id;
    const isAdmin = currentUser.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Access denied');
    }

    const user = await this.userRepository.findOne({
      _id: new ObjectId(id),
      deletedAt: null,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.role && !isAdmin) {
      throw new ForbiddenException('Only admins can change user roles');
    }

    // Update User-level fields
    if (updateUserDto.password) {
      user.password = await utils.hashPassword(updateUserDto.password);
    }
    if (updateUserDto.email) {
      user.email = updateUserDto.email;
    }
    if (updateUserDto.role) {
      user.role = updateUserDto.role;
    }
    user.updatedAt = new Date();

    // Update Customer-level fields if applicable
    if (user.role === UserRole.CUSTOMER) {
      const customer = await this.customerRepository.findOne({ user });
      if (customer) {
        if (updateUserDto.fullName) customer.fullName = updateUserDto.fullName;
        if (updateUserDto.phone !== undefined) customer.phone = updateUserDto.phone;
        if (updateUserDto.deliveryAccess !== undefined) customer.deliveryAccess = updateUserDto.deliveryAccess;
        customer.updatedAt = new Date();
      }
    }

    await this.userRepository.getEntityManager().flush();
    return user;
  }

  async updateStatus(id: string, dto: UpdateUserStatusDto) {
    const user = await this.userRepository.findOne({
      _id: new ObjectId(id),
      deletedAt: null,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = dto.isActive;
    user.updatedAt = new Date();
    await this.userRepository.getEntityManager().persistAndFlush(user);

    return {
      message: `User ${dto.isActive ? 'activated' : 'deactivated'} successfully`,
    };
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({
      _id: new ObjectId(id),
      deletedAt: null,
    });

    if (!user) {
      throw new Error('User not found');
    }

    user.deletedAt = new Date();
    await this.userRepository.getEntityManager().persistAndFlush(user);

    return { message: 'User deleted successfully' };
  }
}
