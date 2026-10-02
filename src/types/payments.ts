import type { OrderStatus, PaymentMethod, PaymentStatus } from "./orders";

export interface PaymentCustomer {
  id: string;
  name: string;
  companyName: string | null;
}

export interface PaymentOrder {
  id: string;
  orderNumber: number;
  status: string;

  total: string;
  paidAmount: string;
  paymentStatus: PaymentStatus;

  customer: PaymentCustomer;
}

export interface Payment {
  id: string;
  orderId: string;

  amount: string;
  method: PaymentMethod;

  paidAt: string;

  reference: string | null;
  notes: string | null;

  createdAt: string;

  order: PaymentOrder;
}

export interface PaymentListResponse {
  data: Payment[];

  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaymentFilters {
  page?: number;
  limit?: number;

  orderId?: string;
  orderNumber?: number;

  method?: PaymentMethod;

  from?: string;
  to?: string;
}

export interface CreatePaymentPayload {
  orderId: string;
  amount: string;
  method: PaymentMethod;

  paidAt?: string;

  reference?: string;
  notes?: string;
}

export interface PaymentAvailableOrderCustomer {
  id: string;
  name: string;
  companyName: string | null;
}

export interface PaymentAvailableOrder {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  total: string;
  paidAmount: string;
  paymentStatus: PaymentStatus;
  customer: PaymentAvailableOrderCustomer;
}
