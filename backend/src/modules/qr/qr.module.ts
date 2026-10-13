import { Module } from '@nestjs/common';
import { QrService } from './qr.service.js';
import { QrController } from './qr.controller.js';

@Module({
  controllers: [QrController],
  providers: [QrService],
  exports: [QrService],
})
export class QrModule {}
