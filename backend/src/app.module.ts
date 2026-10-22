import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import configuration from './config/configuration.js';
import { DatabaseModule } from './database/database.module.js';
import { AuditModule } from './modules/audit/audit.module.js';
import { BootstrapModule } from './modules/bootstrap/bootstrap.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { RestaurantsModule } from './modules/restaurants/restaurants.module.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { DishesModule } from './modules/dishes/dishes.module.js';
import { MediaModule } from './modules/media/media.module.js';
import { QrModule } from './modules/qr/qr.module.js';
import { PublicMenuModule } from './modules/public-menu/public-menu.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { HealthModule } from './modules/health/health.module.js';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb.uri'),
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('throttler.ttl') || 60,
          limit: configService.get<number>('throttler.limit') || 100,
        },
      ],
      inject: [ConfigService],
    }),
    DatabaseModule,
    AuditModule,
    BootstrapModule,
    AuthModule,
    UsersModule,
    RestaurantsModule,
    CategoriesModule,
    DishesModule,
    MediaModule,
    QrModule,
    PublicMenuModule,
    OrdersModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
