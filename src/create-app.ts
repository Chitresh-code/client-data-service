import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

// Docs (/docs) are only useful for humans exploring the API -- hide them outside
// local/staging, matching the convention already established in market-data-service.
const SHOW_DOCS_IN = new Set(['local', 'staging']);

// Single source of truth for app wiring, shared by the long-running dev server
// (main.ts, which additionally calls app.listen()) and the Vercel serverless
// entrypoint (api/index.ts, which calls app.init() and reuses the instance across
// warm invocations instead) -- mirrors identity-service's pkg/server.New() pattern.
export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const config = app.get(ConfigService);
  const environment = config.get<string>('app.environment')!;

  app.use(helmet());
  app.enableCors({
    origin: config.get<string[]>('app.corsOrigins'),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (SHOW_DOCS_IN.has(environment)) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('client-data-service')
        .setVersion('0.1')
        .build(),
    );
    SwaggerModule.setup('docs', app, document);
  }

  app.enableShutdownHooks();
  return app;
}
