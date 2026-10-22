import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(150),
  productSituationId: z.number().int().positive().max(2147483647),
  productCategoryId: z.number().int().positive().max(2147483647),
});

export const updateProductSchema = createProductSchema.partial().strict().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Provide at least one field to update" },
);
//ola
//Vou terminar professor 
//e os bate estaca
// si foda falou
