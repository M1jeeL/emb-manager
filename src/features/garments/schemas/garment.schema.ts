import { z } from "zod";

export const garmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(150, "El nombre no puede superar los 150 caracteres."),

  description: z
    .string()
    .max(1000, "La descripción no puede superar los 1000 caracteres.")
    .optional(),
});

export type GarmentFormData = z.infer<typeof garmentSchema>;
