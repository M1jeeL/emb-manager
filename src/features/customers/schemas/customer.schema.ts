import { z } from "zod";

export const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(150, "El nombre no puede superar los 150 caracteres"),

  email: z
    .string()
    .trim()
    .email("Ingresa un email válido")
    .max(150, "El email no puede superar los 150 caracteres")
    .or(z.literal("")),

  phone: z
    .string()
    .trim()
    .max(50, "El teléfono no puede superar los 50 caracteres"),

  taxId: z.string().trim().max(50, "El RUT no puede superar los 50 caracteres"),

  companyName: z
    .string()
    .trim()
    .max(150, "El nombre de empresa no puede superar los 150 caracteres"),

  address: z
    .string()
    .trim()
    .max(255, "La dirección no puede superar los 255 caracteres"),

  city: z
    .string()
    .trim()
    .max(100, "La ciudad no puede superar los 100 caracteres"),

  notes: z
    .string()
    .trim()
    .max(1000, "Las notas no pueden superar los 1000 caracteres"),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
