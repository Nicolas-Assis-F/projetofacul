import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { validate } from "../middlewares/validate";
import { createUserSchema, updateUserSchema } from "../validators/userSchemas";

const router = Router();
const ctrl = new UserController();

router.get("/", ctrl.index.bind(ctrl));
router.get("/:id", ctrl.show.bind(ctrl));
router.post("/", validate(createUserSchema), ctrl.store.bind(ctrl));
router.put("/:id", validate(updateUserSchema), ctrl.update.bind(ctrl));
router.delete("/:id", ctrl.destroy.bind(ctrl));

export default router;
