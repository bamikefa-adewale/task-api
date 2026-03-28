import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import * as fs from 'fs';
import { Logger } from '@nestjs/common';
import { appCreate } from 'app.create';

async function bootstrap() {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  dotenv.config({ path: '.env' });
  dotenv.config({ path: `.env.${nodeEnv}`, override: true });

  const logger = new Logger('bootstrap');
  logger.log(`NODE_ENV: ${process.env.NODE_ENV ?? 'not set'}`);
  logger.log(`PORT: ${process.env.PORT ?? '8008'}`);

  const keyPath = process.env.SSL_KEY_PATH;
  const certPath = process.env.SSL_CERT_PATH;
  const httpsOptions =
    keyPath &&
    certPath &&
    fs.existsSync(keyPath) &&
    fs.existsSync(certPath)
      ? {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        }
      : undefined;

  const app = httpsOptions
    ? await NestFactory.create(AppModule, { httpsOptions })
    : await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  appCreate(app);

  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT ? Number(process.env.PORT) : 8008;
  await app.listen(port);
  const protocol = httpsOptions ? 'https' : 'http';
  logger.log(
    `Application is running on: ${protocol}://localhost:${port}/api/v1`,
  );
}

bootstrap();
