import { Router } from "express";
import { ProductController } from "../controllers/ProductController";

const router = Router();
const ctrl = new ProductController();

router.get("/", ctrl.index.bind(ctrl));
router.get("/:id", ctrl.show.bind(ctrl));
router.post("/", ctrl.store.bind(ctrl));
router.put("/:id", ctrl.update.bind(ctrl));
router.delete("/:id", ctrl.destroy.bind(ctrl));

export default router;
