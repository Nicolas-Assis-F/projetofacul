import { Router } from "express";
import userRoutes from "./userRoutes";
import productRoutes from "./productRoutes";

import catalogRoutes from "./catalogRoutes";

import loanRoutes from "./loanRoutes";

const router = Router();

router.use("/loans", loanRoutes);
router.use("/catalogs", catalogRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);

export default router;
