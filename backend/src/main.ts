import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

import path from 'path';
import fs from 'fs';
import express from 'express';

// Prasadam Dine API Bootstrapper

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { rawBody: true });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 4000;
  let apiPrefix = configService.get<string>('apiPrefix') || 'api/v1';
  // Normalize if Render environment variable has 'pi/v1' typo
  if (apiPrefix === 'pi/v1' || apiPrefix === '/pi/v1' || !apiPrefix) {
    apiPrefix = 'api/v1';
  }
  const frontendBaseUrl = configService.get<string>('frontendBaseUrl') || 'http://localhost:3000';

  // Support both /api/v1 and /pi/v1 paths transparently
  app.use((req: any, _res: any, next: () => void) => {
    if (req.url && req.url.startsWith('/pi/v1')) {
      req.url = req.url.replace(/^\/pi\/v1/, '/api/v1');
    }
    next();
  });

  // Serve static 3D models directory
  const modelsDir = path.resolve(process.cwd(), 'public/models');
  if (fs.existsSync(modelsDir)) {
    app.use('/models', express.static(modelsDir));
    app.use(`/${apiPrefix}/models`, express.static(modelsDir));
  }

  // Serve static images directory
  const imagesDir = path.resolve(process.cwd(), 'public/images');
  if (fs.existsSync(imagesDir)) {
    app.use('/images', express.static(imagesDir));
    app.use(`/${apiPrefix}/images`, express.static(imagesDir));
  }

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
      'https://pasadam-dine.onrender.com',
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

      // Allow all Vercel deployment preview and production domains
      const isVercelDomain =
        normalizedOrigin.endsWith('.vercel.app') ||
        /\.vercel\.app$/.test(normalizedOrigin) ||
        normalizedOrigin.includes('vercel.app');

      // Allow Render origins
      const isRenderDomain =
        normalizedOrigin.endsWith('.onrender.com') ||
        normalizedOrigin.includes('onrender.com');

      const isLocalDevMatch =
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin);

      if (isDirectMatch || isSubdomainMatch || isVercelDomain || isRenderDomain || isLocalDevMatch) {
        callback(null, true);
      } else {
        logger.warn(`Blocked CORS request from disallowed origin: ${requestOrigin}`);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
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
