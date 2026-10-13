import { Module } from '@nestjs/common';
import { MediaService } from './media.service.js';
import { MediaController } from './media.controller.js';
import { LocalStorageProvider } from './providers/local-storage.provider.js';
import { CloudinaryStorageProvider } from './providers/cloudinary-storage.provider.js';

@Module({
  controllers: [MediaController],
  providers: [MediaService, LocalStorageProvider, CloudinaryStorageProvider],
  exports: [MediaService],
})
export class MediaModule {}
