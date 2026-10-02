import { z } from "zod";

export const paymentSchema = z.object({
  orderId: z.string().uuid("Selecciona una orden"),

  amount: z
    .string()
    .trim()
    .min(1, "Ingresa el monto")
    .refine(
      (value) => {
        const amount = Number(value);
        return Number.isFinite(amount) && amount > 0;
      },
      {
        message: "El monto debe ser mayor a $0",
      },
    )
    .refine(
      (value) => {
        const decimals = value.split(".")[1];
        return !decimals || decimals.length <= 2;
      },
      {
        message: "El monto puede tener máximo 2 decimales",
      },
    ),

  method: z.enum([
    "CASH",
    "BANK_TRANSFER",
    "DEBIT_CARD",
    "CREDIT_CARD",
    "OTHER",
  ]),

  paidAt: z
    .string()
    .min(1, "Selecciona la fecha del pago")
    .refine(
      (value) => {
        return new Date(value).getTime() <= Date.now();
      },
      {
        message: "La fecha del pago no puede estar en el futuro",
      },
    ),

  reference: z
    .string()
    .trim()
    .max(255, "La referencia no puede superar los 255 caracteres")
    .optional(),

  notes: z
    .string()
    .trim()
    .max(2000, "Las notas no pueden superar los 2000 caracteres")
    .optional(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;
