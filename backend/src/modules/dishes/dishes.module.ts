import { Module } from '@nestjs/common';
import { DishesService } from './dishes.service.js';
import { DishesController } from './dishes.controller.js';

@Module({
  controllers: [DishesController],
  providers: [DishesService],
  exports: [DishesService],
})
export class DishesModule {}
