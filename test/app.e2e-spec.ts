import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

// Boots the real AppModule -- including TypeOrmModule -- against the local Postgres
// database configured in .env. No mocked DB: a broken TypeORM config or migration
// should fail this test, not just unit tests with a fake repository.
describe('Health (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health/live (GET) is public and does not require a token', () => {
    return request(app.getHttpServer()).get('/health/live').expect(200);
  });

  it('/health/ready (GET) confirms the database connection is up', () => {
    return request(app.getHttpServer()).get('/health/ready').expect(200);
  });
});

describe('Customers (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/customers (GET) requires a token', () => {
    return request(app.getHttpServer()).get('/customers').expect(401);
  });

  it('/customers (POST) requires a token', () => {
    return request(app.getHttpServer())
      .post('/customers')
      .send({ name: 'Acme Corp' })
      .expect(401);
  });
});
