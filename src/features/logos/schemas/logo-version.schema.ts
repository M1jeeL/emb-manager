import { z } from "zod";

export const createLogoVersionSchema = z.object({
  widthMm: z
    .string()
    .optional()
    .refine((value) => !value || /^\d+(\.\d{1,2})?$/.test(value), {
      message: "Debe ser un valor válido con máximo 2 decimales",
    }),

  heightMm: z
    .string()
    .optional()
    .refine((value) => !value || /^\d+(\.\d{1,2})?$/.test(value), {
      message: "Debe ser un valor válido con máximo 2 decimales",
    }),

  stitchCount: z
    .number()
    .int("Debe ser un número entero")
    .min(0, "No puede ser negativo")
    .optional(),

  notes: z.string().max(2000, "Máximo 2000 caracteres").optional(),
});

export type CreateLogoVersionForm = z.infer<typeof createLogoVersionSchema>;
