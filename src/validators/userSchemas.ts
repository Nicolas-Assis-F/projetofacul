import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2).max(150),
  email: z.string().email().max(200),
  situationId: z.number().int().positive(),
});

export const updateUserSchema = createUserSchema.partial();
