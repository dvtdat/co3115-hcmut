import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiOkResponse,
  ApiOperation, ApiTags, getSchemaPath,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole, Category } from 'src/entities';
import { RoleGuard } from 'src/common/guards/role.guard';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'List all categories' })
  @ApiOkResponse({
    schema: {
      properties: {
        data: { type: 'array', items: { $ref: getSchemaPath(Category) } },
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
  ) {
    return this.categoryService.findAll(pageSize, pageNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiOkResponse({ type: Category })
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a category (admin)' })
  @ApiCreatedResponse({ type: Category })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a category (admin)' })
  @ApiOkResponse({ type: Category })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a category (admin)' })
  delete(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
