import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import request from 'supertest';
import { HealthController } from '../src/modules/health/health.controller.js';

describe('Health E2E', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const mockConnection = { readyState: 1 };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  it('/api/v1/health (GET) returns 200 with service status ok and connected database', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'prasadam_dine_backend',
      version: '1.0.0',
      database: {
        connected: true,
        state: 'connected',
      },
    });
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });
});
