import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/index.js';

@ApiTags('Audit & Activity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List platform administrative activity logs (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'List of audit records' })
  async findAll(
    @Query('limit') limit?: number,
    @Query('restaurantId') restaurantId?: string,
  ) {
    const numLimit = limit ? Math.min(Number(limit), 200) : 100;
    return this.auditService.findAll(numLimit, restaurantId);
  }
}
