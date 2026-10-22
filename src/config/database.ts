import "reflect-metadata";
import path from "path";
import { DataSource } from "typeorm";
import { Loan } from "../entities/Loan";
import dotenv from "dotenv";
import { Situation } from "../entities/Situation";
import { User } from "../entities/User";
import { ProductCategory } from "../entities/ProductCategory";
import { ProductSituation } from "../entities/ProductSituation";
import { Product } from "../entities/Product";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL || undefined,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : false,
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
  database: process.env.DB_NAME || "baiao_db",
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: [Situation, User, ProductCategory, ProductSituation, Product, Loan],
  migrations: [path.join(__dirname, "..", "migrations", "*{.ts,.js}")],
  subscribers: [],
});
