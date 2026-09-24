import { z } from "zod";

const orderLogoSchema = z.object({
  logoId: z.string().uuid("Selecciona un logo válido"),
  quantity: z.number().int().min(1, "La cantidad debe ser al menos 1"),
  placement: z
    .string()
    .trim()
    .max(100, "La ubicación es demasiado larga")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(500, "Las notas son demasiado largas")
    .optional()
    .or(z.literal("")),
});

const orderItemSchema = z.object({
  garmentId: z.string().uuid("Selecciona una prenda válida"),

  description: z
    .string()
    .trim()
    .max(255, "La descripción es demasiado larga")
    .optional()
    .or(z.literal("")),

  quantity: z
    .number()
    .int("La cantidad debe ser un número entero")
    .min(1, "La cantidad debe ser al menos 1"),

  unitPrice: z
    .number()
    .finite("Ingresa un precio válido")
    .min(0, "El precio no puede ser negativo"),

  notes: z
    .string()
    .trim()
    .max(500, "Las notas son demasiado largas")
    .optional()
    .or(z.literal("")),

  logos: z.array(orderLogoSchema),
});

export const orderSchema = z.object({
  customerId: z.string().uuid("Selecciona un cliente válido"),

  status: z.enum(["QUOTE", "PENDING"]),

  promisedAt: z.string().optional().or(z.literal("")),

  discount: z
    .number()
    .finite("Ingresa un descuento válido")
    .min(0, "El descuento no puede ser negativo"),

  notes: z
    .string()
    .trim()
    .max(1000, "Las notas son demasiado largas")
    .optional()
    .or(z.literal("")),

  items: z
    .array(orderItemSchema)
    .min(1, "El pedido debe tener al menos una prenda"),
});

export type OrderFormData = z.infer<typeof orderSchema>;
export type OrderItemFormData = z.infer<typeof orderItemSchema>;
