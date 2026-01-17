import { DataSource } from 'typeorm';
import { SportsArticle } from '../entity/SportsArticle';
import * as path from 'path';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'sports_articles',
  synchronize: process.env.NODE_ENV !== 'production', // Use migrations in production
  logging: false,
  entities: [SportsArticle],
  migrations: [path.join(__dirname, '../migrations/*.ts')],
  subscribers: [],
});
