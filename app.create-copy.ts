import {
  INestApplication,
  ValidationPipe,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Reflector } from '@nestjs/core';

export function appCreateCopy(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  const port = process.env.PORT ? Number(process.env.PORT) : 8008;
  const localServerUrl = `http://localhost:${port}`;
  const publicApiUrl = process.env.API_PUBLIC_URL?.trim();

  let swaggerConfig = new DocumentBuilder()
    .setTitle('Todo Task API')
    .setDescription(
      [
        '**OAS 3.0**',
        '',
        'REST API for Google Sign-In, token refresh/logout, and user-scoped tasks.',
        '',
        'All routes are under the global prefix **`/api/v1`** (e.g. `GET /api/v1/tasks`). Interactive docs are served at **`/api`** relative to the app root.',
        '',
        'Authenticated task routes and `POST /auth/logout` require `Authorization: Bearer <accessToken>`.',
      ].join('\n'),
    )
    .setVersion('1.0')
    .setOpenAPIVersion('3.0.0')
    .addTag('Auth', 'Google OAuth token exchange, refresh, and logout')
    .addTag('Tasks', 'CRUD-style task operations for the signed-in user')
    .addServer(
      localServerUrl,
      `Local — use PORT from the environment (default 8008); paths include /api/v1`,
    );

  if (publicApiUrl) {
    swaggerConfig = swaggerConfig.addServer(
      publicApiUrl,
      'Public base URL (set `API_PUBLIC_URL`; paths include /api/v1)',
    );
  }

  const config = swaggerConfig.build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const corsOrigins = process.env.CORS_ORIGIN?.split(',').map((o) => o.trim());

  app.enableCors({
    origin: corsOrigins?.length ? corsOrigins : true,
    methods: 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
  });
}
