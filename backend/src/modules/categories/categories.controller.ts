import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto, ReorderCategoriesDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';
import { Role } from '../../common/enums/index.js';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('restaurants/:restaurantId/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER)
  @ApiOperation({ summary: 'Create category in restaurant' })
  @ApiResponse({ status: 201, description: 'Category created' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(user, restaurantId, dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER, Role.RESTAURANT_STAFF)
  @ApiOperation({ summary: 'List categories for restaurant' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.categoriesService.findAllByRestaurant(user, restaurantId);
  }

  @Put('reorder')
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER)
  @ApiOperation({ summary: 'Reorder categories display order' })
  async reorder(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
    @Body() dto: ReorderCategoriesDto,
  ) {
    return this.categoriesService.reorder(user, restaurantId, dto);
  }

  @Get(':categoryId')
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER, Role.RESTAURANT_STAFF)
  @ApiOperation({ summary: 'Get category details' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.categoriesService.findById(user, restaurantId, categoryId);
  }

  @Patch(':categoryId')
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER)
  @ApiOperation({ summary: 'Update category' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(user, restaurantId, categoryId, dto);
  }

  @Delete(':categoryId')
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER)
  @ApiOperation({ summary: 'Delete category (guarded against orphan dishes)' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.categoriesService.remove(user, restaurantId, categoryId);
  }
}
