import { DataSource } from 'typeorm';
import { join } from 'path';
import dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  logging: false,
  synchronize: false,
  entities: [join(__dirname, '../entities/*.entity.{ts,js}')],
  migrations: [join(__dirname, '../migrations/*.{ts,js}')],
  subscribers: [join(__dirname, '../subscribers/*.{ts,js}')],
});
