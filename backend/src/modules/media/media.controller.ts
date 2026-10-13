import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { MediaService } from './media.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';
import { MediaType, Role } from '../../common/enums/index.js';

@ApiTags('Media Assets')
@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER)
  @Post('restaurants/:restaurantId/media/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload dish image, 3D model (.glb/.gltf), or restaurant logo' })
  @ApiQuery({ name: 'mediaType', enum: MediaType, required: true })
  @ApiQuery({ name: 'dishId', required: false, description: 'Optional dish ID to associate with' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async upload(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('mediaType') mediaType: MediaType,
    @Query('dishId') dishId?: string,
  ) {
    if (!mediaType) {
      throw new BadRequestException('mediaType query parameter is required (IMAGE, MODEL_3D, LOGO)');
    }
    return this.mediaService.uploadMedia(user, restaurantId, file, mediaType, dishId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER)
  @Get('restaurants/:restaurantId/media')
  @ApiOperation({ summary: 'List media assets uploaded for a restaurant' })
  async listMedia(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.mediaService.findByRestaurant(user, restaurantId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER)
  @Delete('restaurants/:restaurantId/media/:assetId')
  @ApiOperation({ summary: 'Delete a media asset' })
  async deleteMedia(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
    @Param('assetId') assetId: string,
  ) {
    return this.mediaService.deleteMedia(user, restaurantId, assetId);
  }

  @Public()
  @Get('media/file/{*path}')
  @ApiOperation({ summary: 'Public access to uploaded media files (Local fallback)' })
  async serveFile(@Param() params: Record<string, string>, @Res() res: Response) {
    const rawPath = params['path'] || params['0'];
    if (!rawPath) {
      throw new NotFoundException('File path missing');
    }

    const filePath = this.mediaService.getLocalFilePath(rawPath);
    if (!filePath) {
      throw new NotFoundException('Requested file not found');
    }

    res.sendFile(filePath);
  }
}
