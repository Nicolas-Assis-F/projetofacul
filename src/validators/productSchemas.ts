import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2).max(150),
  productSituationId: z.number().int().positive(),
  productCategoryId: z.number().int().positive(),
});

export const updateProductSchema = createProductSchema.partial();
//ola
//Vou terminar professor 