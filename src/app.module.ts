import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import jwtConfig from './config/jwt.config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import environmentValidattion from './config/environment.validattion';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { AuthenticationGuard } from './auth/guards/authentication/authentication.guard';
import { AccessTokenGuard } from './auth/guards/access-token/access-token.guard';
import dbConfig from './config/db.config';

/** Unset NODE_ENV → treat as development so `.env.development` loads (not only empty/missing `.env`). */
const nodeEnv = process.env.NODE_ENV ?? 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.${nodeEnv}`],
      load: [dbConfig, jwtConfig],
      validationSchema: environmentValidattion,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('db.databaseUrl'),
        autoLoadEntities: configService.get('db.autoLoadEntities'),
        synchronize: configService.get('db.synchronize'),
      }),
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          audience: configService.get<string>('jwt.audience'),
          issuer: configService.get<string>('jwt.issuer'),
        },
      }),
    }),
    AuthModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    AccessTokenGuard,
  ],
})
export class AppModule {}
