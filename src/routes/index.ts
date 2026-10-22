import { Router } from "express";
import userRoutes from "./userRoutes";
import productRoutes from "./productRoutes";

import catalogRoutes from "./catalogRoutes";

const router = Router();

router.use("/catalogs", catalogRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);

export default router;
