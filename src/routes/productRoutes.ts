import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { validate } from "../middlewares/validate";
import {
  createProductSchema,
  updateProductSchema,
} from "../validators/productSchemas";

const router = Router();
const ctrl = new ProductController();

router.get("/", ctrl.index.bind(ctrl));
router.get("/:id", ctrl.show.bind(ctrl));
router.post("/", validate(createProductSchema), ctrl.store.bind(ctrl));
router.put("/:id", validate(updateProductSchema), ctrl.update.bind(ctrl));
router.delete("/:id", ctrl.destroy.bind(ctrl));

export default router;
