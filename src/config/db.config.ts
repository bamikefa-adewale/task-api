import { registerAs } from '@nestjs/config';

export default registerAs('db', () => ({
  databaseUrl: process.env.DATABASE_URL,
  synchronize: process.env.DATABASE_SYNC === 'true' ? true : false,
  autoLoadEntities:
    process.env.DATABASE_AUTO_LOAD_ENTITIES?.toLowerCase().trim() === 'true',
}));
