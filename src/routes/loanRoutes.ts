import { Router } from "express";
import { z } from "zod";
import { validate } from "../middlewares/validate";
import { parsePagination, validateId } from "../middlewares/validateParams";
import { LoanService } from "../services/LoanService";
const router = Router();
const service = new LoanService();
const schema = z.object({
  userId: z.number().int().positive().max(2147483647),
  productId: z.number().int().positive().max(2147483647),
  dueAt: z
    .string()
    .datetime({ offset: true })
    .refine(
      (value) => new Date(value).getTime() > Date.now(),
      "A devolução deve ser no futuro.",
    ),
  notes: z.string().trim().max(500).optional(),
});
router.param("id", validateId);
router.get("/", async (req, res, next) => {
  try {
    res.json(await service.findAll(parsePagination(req.query)));
  } catch (e) {
    next(e);
  }
});
router.post("/", validate(schema), async (req, res, next) => {
  try {
    res.status(201).json(await service.create(req.body));
  } catch (e) {
    next(e);
  }
});
router.post("/:id/return", async (req, res, next) => {
  try {
    res.json(await service.returnLoan(Number(req.params.id)));
  } catch (e) {
    next(e);
  }
});
export default router;
