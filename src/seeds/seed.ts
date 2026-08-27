import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import { AppDataSource } from "../config/database";
import { Situation } from "../entities/Situation";
import { ProductCategory } from "../entities/ProductCategory";
import { ProductSituation } from "../entities/ProductSituation";

async function seed(): Promise<void> {
  await AppDataSource.initialize();
  console.log("Database connected for seeding...");

  const situationRepo = AppDataSource.getRepository(Situation);
  const situations = ["Active", "Inactive", "Pending"];
  for (const nameSituation of situations) {
    const exists = await situationRepo.findOneBy({ nameSituation });
    if (!exists) {
      await situationRepo.save(situationRepo.create({ nameSituation }));
    }
  }
  console.log("Situations seeded.");

  const categoryRepo = AppDataSource.getRepository(ProductCategory);
  const categories = [
    "Electronics",
    "Clothing",
    "Food & Beverages",
    "Home & Garden",
    "Sports",
  ];
  for (const name of categories) {
    const exists = await categoryRepo.findOneBy({ name });
    if (!exists) {
      await categoryRepo.save(categoryRepo.create({ name }));
    }
  }
  console.log("Product categories seeded.");

  const productSituationRepo = AppDataSource.getRepository(ProductSituation);
  const productSituations = ["Available", "Out of Stock", "Discontinued"];
  for (const name of productSituations) {
    const exists = await productSituationRepo.findOneBy({ name });
    if (!exists) {
      await productSituationRepo.save(productSituationRepo.create({ name }));
    }
  }
  console.log("Product situations seeded.");

  await AppDataSource.destroy();
  console.log("Seeding completed successfully!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
