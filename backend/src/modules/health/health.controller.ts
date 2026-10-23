import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { Public } from '../../common/decorators/public.decorator.js';

@ApiTags('Health')
@Public()
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  @ApiOperation({ summary: 'Platform health status and database connectivity check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  check() {
    const isDbConnected = this.connection.readyState === 1;

    return {
      status: isDbConnected ? 'ok' : 'degraded',
      service: 'ar_dine_backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: isDbConnected,
        state: this.connection.readyState === 1 ? 'connected' : 'disconnected',
      },
    };
  }
}
