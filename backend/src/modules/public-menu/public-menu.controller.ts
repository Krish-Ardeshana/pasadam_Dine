import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PublicMenuService } from './public-menu.service.js';
import { Public } from '../../common/decorators/public.decorator.js';

@ApiTags('Public Menu & AR Dining')
@Public()
@Controller('public/restaurants')
export class PublicMenuController {
  constructor(private readonly publicMenuService: PublicMenuService) {}

  @Get(':restaurantSlug')
  @ApiOperation({ summary: 'Public restaurant profile and basic dining details' })
  @ApiResponse({ status: 200, description: 'Public restaurant profile' })
  @ApiResponse({ status: 404, description: 'Restaurant not found or inactive' })
  async getProfile(@Param('restaurantSlug') restaurantSlug: string) {
    return this.publicMenuService.getRestaurantProfile(restaurantSlug);
  }

  @Get(':restaurantSlug/menu')
  @ApiOperation({ summary: 'Complete public restaurant menu grouped by category' })
  @ApiResponse({ status: 200, description: 'Public grouped menu' })
  async getFullMenu(@Param('restaurantSlug') restaurantSlug: string) {
    return this.publicMenuService.getFullMenu(restaurantSlug);
  }

  @Get(':restaurantSlug/categories')
  @ApiOperation({ summary: 'Public categories list for restaurant' })
  async getCategories(@Param('restaurantSlug') restaurantSlug: string) {
    return this.publicMenuService.getCategories(restaurantSlug);
  }

  @Get(':restaurantSlug/dishes')
  @ApiOperation({ summary: 'Public published dishes with 2D images and 3D AR assets' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'dietary', required: false, example: 'VEG' })
  async getDishes(
    @Param('restaurantSlug') restaurantSlug: string,
    @Query('categoryId') categoryId?: string,
    @Query('dietary') dietary?: string,
  ) {
    return this.publicMenuService.getPublishedDishes(restaurantSlug, categoryId, dietary);
  }

  @Get(':restaurantSlug/dishes/:dishSlug')
  @ApiOperation({ summary: 'Public dish details with 3D model asset reference for AR view' })
  @ApiResponse({ status: 200, description: 'Dish details with 3D GLB reference' })
  @ApiResponse({ status: 404, description: 'Dish not found or unpublished' })
  async getDish(
    @Param('restaurantSlug') restaurantSlug: string,
    @Param('dishSlug') dishSlug: string,
  ) {
    return this.publicMenuService.getDishBySlug(restaurantSlug, dishSlug);
  }
}
