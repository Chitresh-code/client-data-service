import 'dotenv/config';
import { DataSource } from 'typeorm';

// Standalone DataSource for the TypeORM CLI (migration:generate/run/revert) -- the CLI
// runs outside Nest's DI container, so this reads process.env directly instead of going
// through ConfigModule. Keep entity/migration globs in sync with database.module.ts.
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
