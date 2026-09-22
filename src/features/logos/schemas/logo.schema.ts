import { z } from "zod";

export const logoSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(150, "El nombre no puede superar los 150 caracteres"),

  customerId: z.string().optional(),

  description: z
    .string()
    .trim()
    .max(1000, "La descripción no puede superar los 1000 caracteres")
    .optional(),

  currentPrice: z.string().refine((value) => {
    if (!value) return true;

    const number = Number(value);

    return Number.isFinite(number) && number >= 0;
  }, "El precio debe ser un número válido"),
});

export type LogoFormData = z.infer<typeof logoSchema>;
