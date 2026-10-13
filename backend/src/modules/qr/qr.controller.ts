import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { QrService } from './qr.service.js';
import { GenerateQrDto } from './dto/generate-qr.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';
import { Role } from '../../common/enums/index.js';

@ApiTags('QR Codes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('restaurants/:restaurantId/qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Post('generate')
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER)
  @ApiOperation({ summary: 'Generate restaurant menu or direct dish QR code' })
  @ApiResponse({ status: 201, description: 'QR code generated' })
  async generate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
    @Body() dto: GenerateQrDto,
  ) {
    return this.qrService.generate(user, restaurantId, dto);
  }

  @Post(':qrId/regenerate')
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER)
  @ApiOperation({ summary: 'Regenerate QR image data preserving stable target URL' })
  async regenerate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
    @Param('qrId') qrId: string,
  ) {
    return this.qrService.regenerate(user, restaurantId, qrId);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER, Role.RESTAURANT_STAFF)
  @ApiOperation({ summary: 'List QR codes for a restaurant' })
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.qrService.findByRestaurant(user, restaurantId);
  }

  @Get(':qrId')
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER, Role.RESTAURANT_STAFF)
  @ApiOperation({ summary: 'Get QR code details and image data' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
    @Param('qrId') qrId: string,
  ) {
    return this.qrService.findById(user, restaurantId, qrId);
  }

  @Get(':qrId/download')
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER, Role.RESTAURANT_STAFF)
  @ApiOperation({ summary: 'Download binary PNG image of the QR code' })
  async download(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
    @Param('qrId') qrId: string,
    @Res() res: Response,
  ) {
    const qr = await this.qrService.findById(user, restaurantId, qrId);
    const base64Data = qr.imageData.replace(/^data:image\/png;base64,/, '');
    const imgBuffer = Buffer.from(base64Data, 'base64');

    res.setHeader('Content-Type', 'image/png');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="qr-${qr.qrType.toLowerCase()}-${qr._id.toString()}.png"`,
    );
    res.send(imgBuffer);
  }
}
