import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service.js';
import { CreateRestaurantDto } from './dto/create-restaurant.dto.js';
import {
  UpdateRestaurantDto,
  UpdateApprovalStatusDto,
  TransferOwnershipDto,
} from './dto/update-restaurant.dto.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';
import { Role } from '../../common/enums/index.js';

@ApiTags('Restaurants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER)
  @ApiOperation({ summary: 'Register a new restaurant' })
  @ApiResponse({ status: 201, description: 'Restaurant created' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateRestaurantDto,
  ) {
    return this.restaurantsService.create(user, dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER)
  @ApiOperation({ summary: 'List restaurants (filtered to authorized tenants)' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.restaurantsService.findAll(user, paginationDto);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER, Role.RESTAURANT_STAFF)
  @ApiOperation({ summary: 'Get restaurant administrative profile by ID' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.restaurantsService.findById(user, id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER)
  @ApiOperation({ summary: 'Update restaurant details' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateRestaurantDto,
  ) {
    return this.restaurantsService.update(user, id, dto);
  }

  @Patch(':id/approval')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Approve, reject, or suspend a restaurant (Super Admin only)' })
  async updateApproval(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateApprovalStatusDto,
  ) {
    return this.restaurantsService.updateApprovalStatus(admin, id, dto);
  }

  @Patch(':id/owner')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Transfer restaurant ownership to another user (Super Admin only)' })
  async transferOwner(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: TransferOwnershipDto,
  ) {
    return this.restaurantsService.transferOwnership(admin, id, dto);
  }
}
