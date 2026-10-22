import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(150),
  email: z.string().trim().toLowerCase().email().max(200),
  situationId: z.number().int().positive().max(2147483647),
});

export const updateUserSchema = createUserSchema
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });
