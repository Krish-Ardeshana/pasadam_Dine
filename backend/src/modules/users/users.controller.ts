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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { CreateStaffDto, AssignRestaurantDto } from './dto/create-staff.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';
import { Role } from '../../common/enums/index.js';

@ApiTags('Users & Staff')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all platform users (Super Admin only)' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @Post('staff')
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER)
  @ApiOperation({ summary: 'Create a manager or staff user assigned to a restaurant' })
  async createStaff(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateStaffDto,
  ) {
    return this.usersService.createStaff(user, dto);
  }

  @Post('assign-restaurant')
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER)
  @ApiOperation({ summary: 'Assign a restaurant to an existing user' })
  async assignRestaurant(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AssignRestaurantDto,
  ) {
    return this.usersService.assignRestaurant(user, dto);
  }

  @Delete(':userId/assignments/:restaurantId')
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER)
  @ApiOperation({ summary: 'Remove restaurant assignment from a user' })
  async removeAssignment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId') userId: string,
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.usersService.removeRestaurantAssignment(user, userId, restaurantId);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get user details by ID (Super Admin)' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user status or role (Super Admin only)' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }
}
