import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DishesService } from './dishes.service.js';
import { CreateDishDto } from './dto/create-dish.dto.js';
import {
  UpdateDishDto,
  UpdateDishPriceDto,
  UpdateDishAvailabilityDto,
  PublishDishDto,
  DishFilterDto,
} from './dto/update-dish.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';
import { Role } from '../../common/enums/index.js';

@ApiTags('Dishes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('restaurants/:restaurantId/dishes')
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER)
  @ApiOperation({ summary: 'Create a new dish in restaurant' })
  @ApiResponse({ status: 201, description: 'Dish created' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
    @Body() dto: CreateDishDto,
  ) {
    return this.dishesService.create(user, restaurantId, dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER, Role.RESTAURANT_STAFF)
  @ApiOperation({ summary: 'List and filter dishes for a restaurant' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
    @Query() filterDto: DishFilterDto,
  ) {
    return this.dishesService.findAll(user, restaurantId, filterDto);
  }

  @Get(':dishId')
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER, Role.RESTAURANT_STAFF)
  @ApiOperation({ summary: 'Get dish details' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
    @Param('dishId') dishId: string,
  ) {
    return this.dishesService.findById(user, restaurantId, dishId);
  }

  @Patch(':dishId')
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER)
  @ApiOperation({ summary: 'Update dish metadata' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
    @Param('dishId') dishId: string,
    @Body() dto: UpdateDishDto,
  ) {
    return this.dishesService.update(user, restaurantId, dishId, dto);
  }

  @Patch(':dishId/price')
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER)
  @ApiOperation({ summary: 'Update dish price' })
  async updatePrice(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
    @Param('dishId') dishId: string,
    @Body() dto: UpdateDishPriceDto,
  ) {
    return this.dishesService.updatePrice(user, restaurantId, dishId, dto);
  }

  @Patch(':dishId/availability')
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER, Role.RESTAURANT_STAFF)
  @ApiOperation({ summary: 'Toggle dish availability' })
  async updateAvailability(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
    @Param('dishId') dishId: string,
    @Body() dto: UpdateDishAvailabilityDto,
  ) {
    return this.dishesService.updateAvailability(user, restaurantId, dishId, dto);
  }

  @Patch(':dishId/publish')
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER)
  @ApiOperation({ summary: 'Publish or unpublish dish on public menu' })
  async publish(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
    @Param('dishId') dishId: string,
    @Body() dto: PublishDishDto,
  ) {
    return this.dishesService.publish(user, restaurantId, dishId, dto);
  }

  @Delete(':dishId')
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER)
  @ApiOperation({ summary: 'Delete dish safely' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
    @Param('dishId') dishId: string,
  ) {
    return this.dishesService.remove(user, restaurantId, dishId);
  }
}
