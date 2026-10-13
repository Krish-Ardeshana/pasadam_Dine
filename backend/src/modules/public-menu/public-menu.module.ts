import { Module } from '@nestjs/common';
import { PublicMenuService } from './public-menu.service.js';
import { PublicMenuController } from './public-menu.controller.js';

@Module({
  controllers: [PublicMenuController],
  providers: [PublicMenuService],
  exports: [PublicMenuService],
})
export class PublicMenuModule {}
