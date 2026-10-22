import { Router } from "express";
import { AppDataSource } from "../config/database";
import { Situation } from "../entities/Situation";
import { ProductCategory } from "../entities/ProductCategory";
import { ProductSituation } from "../entities/ProductSituation";

const router = Router();
router.get("/", async (_req, res, next) => {
  try {
    const [situations, productCategories, productSituations] =
      await Promise.all([
        AppDataSource.getRepository(Situation).find({ order: { id: "ASC" } }),
        AppDataSource.getRepository(ProductCategory).find({
          order: { id: "ASC" },
        }),
        AppDataSource.getRepository(ProductSituation).find({
          order: { id: "ASC" },
        }),
      ]);
    res.json({ situations, productCategories, productSituations });
  } catch (error) {
    next(error);
  }
});
export default router;
