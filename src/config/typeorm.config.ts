import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables based on NODE_ENV
const ENV = process.env.NODE_ENV;
const envPath = !ENV ? '.env' : `.env.${ENV}`;

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config(); // Default to .env
}

// Determine if we're running from compiled code (production) or source (development)
// __dirname will be 'dist/src/config' in production and 'src/config' in development (when using ts-node)
const isProduction = __dirname.includes('dist') || process.env.NODE_ENV === 'production';
// In production: __dirname = 'dist/src/config', so rootDir = 'dist/src'
// In development: __dirname = 'src/config', so rootDir = 'src'
const rootDir = path.join(__dirname, '..');

const dataSource = new DataSource({
  type: 'postgres',
  // Use DATABASE_URL if available (for Neon DB and other cloud providers), otherwise use individual parameters
  ...(process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
      }),
  // Entities: works for both .ts (development) and .js (production)
  entities: [path.join(rootDir, '**', '*.entity{.ts,.js}')],
  // Migrations: works for both .ts (development) and .js (production)
  migrations: [path.join(rootDir, 'migrations', '**', '*{.ts,.js}')],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development' || process.env.TYPEORM_LOGGING === 'true',
});

export default dataSource;
