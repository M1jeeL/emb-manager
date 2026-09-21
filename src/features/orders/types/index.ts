export enum OrderStatus {
  QUOTE = "QUOTE",
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  READY = "READY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  UNPAID = "UNPAID",
  PARTIAL = "PARTIAL",
  PAID = "PAID",
}

export interface Customer {
  id: string;
  name: string;
  companyName?: string;
}

export interface OrderItem {
  id: string;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  promisedAt?: string;
  total: number;
  paidAmount: number;
  createdAt: string;
  customer: Customer;
  items: OrderItem[];
}
