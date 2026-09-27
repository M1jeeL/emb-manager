import { z } from "zod";

export const machineSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(100, "El nombre no puede superar los 100 caracteres"),

  code: z
    .string()
    .trim()
    .max(50, "El código no puede superar los 50 caracteres")
    .optional()
    .or(z.literal("")),

  type: z.enum(["EMBROIDERY", "MULTIHEAD", "SINGLEHEAD", "OTHER"]),

  brand: z
    .string()
    .trim()
    .max(100, "La marca no puede superar los 100 caracteres")
    .optional()
    .or(z.literal("")),

  model: z
    .string()
    .trim()
    .max(100, "El modelo no puede superar los 100 caracteres")
    .optional()
    .or(z.literal("")),

  serialNumber: z
    .string()
    .trim()
    .max(100, "El número de serie no puede superar los 100 caracteres")
    .optional()
    .or(z.literal("")),

  needleCount: z
    .number()
    .int("Debe ser un número entero")
    .min(1, "Debe ser mayor que 0")
    .max(1000, "El valor es demasiado alto")
    .optional()
    .nullable(),

  headCount: z
    .number()
    .int("Debe ser un número entero")
    .min(1, "Debe ser mayor que 0")
    .max(100, "El valor es demasiado alto")
    .optional()
    .nullable(),

  notes: z
    .string()
    .trim()
    .max(1000, "Las notas no pueden superar los 1000 caracteres")
    .optional()
    .or(z.literal("")),
});

export type MachineFormData = z.infer<typeof machineSchema>;
