import { z } from "zod";

export const employeeSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(100, "El nombre no puede superar los 100 caracteres"),

  lastName: z
    .string()
    .trim()
    .min(1, "El apellido es obligatorio")
    .max(100, "El apellido no puede superar los 100 caracteres"),

  phone: z
    .string()
    .trim()
    .max(30, "El teléfono no puede superar los 30 caracteres")
    .optional()
    .or(z.literal("")),

  email: z
    .string()
    .trim()
    .email("Ingresa un correo electrónico válido")
    .max(255, "El correo no puede superar los 255 caracteres")
    .optional()
    .or(z.literal("")),

  position: z
    .string()
    .trim()
    .max(100, "El cargo no puede superar los 100 caracteres")
    .optional()
    .or(z.literal("")),

  notes: z
    .string()
    .trim()
    .max(1000, "Las notas no pueden superar los 1000 caracteres")
    .optional()
    .or(z.literal("")),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;
