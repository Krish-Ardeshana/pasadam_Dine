import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

// Prasadam Dine API Bootstrapper

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 4000;
  const apiPrefix = configService.get<string>('apiPrefix') || 'api/v1';
  const frontendBaseUrl = configService.get<string>('frontendBaseUrl') || 'http://localhost:3000';

  // Global API Prefix
  app.setGlobalPrefix(apiPrefix);

  // Global DTO Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS Configuration
  const corsOriginsConfig = configService.get<string[]>('corsOrigins') || [];
  const allowedOrigins = Array.from(
    new Set([
      frontendBaseUrl,
      ...corsOriginsConfig,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ]),
  );

  app.enableCors({
    origin: (
      requestOrigin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!requestOrigin) {
        return callback(null, true);
      }

      const normalizedOrigin = requestOrigin.replace(/\/+$/, '');
      const isDirectMatch = allowedOrigins.includes(normalizedOrigin);
      const isSubdomainMatch = corsOriginsConfig.some((allowed) => {
        if (allowed.startsWith('*.')) {
          return normalizedOrigin.endsWith(allowed.slice(1));
        }
        return false;
      });

      if (isDirectMatch || isSubdomainMatch || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        logger.warn(`Blocked CORS request from disallowed origin: ${requestOrigin}`);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Swagger OpenAPI Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('PRASADAM DINE API')
    .setDescription(
      'Multi-restaurant dining platform with 3D AR menu experiences, tenant isolation, and staff management.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication and token lifecycle')
    .addTag('Restaurants', 'Multi-tenant restaurant management')
    .addTag('Categories', 'Menu categories and reordering')
    .addTag('Dishes', 'Dishes with 2D images and 3D AR models')
    .addTag('Media Assets', 'Cloudinary and local file storage')
    .addTag('QR Codes', 'Dine-in menu and direct dish QR codes')
    .addTag('Public Menu & AR Dining', 'Customer-facing public dining endpoints')
    .addTag('Users & Staff', 'Staff management and platform administration')
    .addTag('Health', 'Platform connectivity and service health')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port, '0.0.0.0');
  logger.log(`Prasadam Dine Backend running on http://0.0.0.0:${port}/${apiPrefix}`);
  logger.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
}

void bootstrap();
