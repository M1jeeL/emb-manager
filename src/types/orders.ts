export type OrderStatus =
  | "QUOTE"
  | "PENDING"
  | "IN_PROGRESS"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID";

export type OrderItemStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

/* ============================================================
 * CUSTOMER
 * ============================================================ */

export interface OrderCustomer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  taxId: string | null;
  companyName: string | null;
  address: string | null;
  city: string | null;
  status: "ACTIVE" | "INACTIVE";
}

/* ============================================================
 * LIST
 * ============================================================ */

export interface OrderListCustomer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  companyName: string | null;
}

export interface OrderCounts {
  items: number;
  payments: number;
  productionJobs: number;
}

export interface OrderListItem {
  id: string;
  organizationId: string;
  customerId: string;
  orderNumber: number;

  status: OrderStatus;
  paymentStatus: PaymentStatus;

  orderedAt: string;
  promisedAt: string | null;
  deliveredAt: string | null;

  subtotal: string;
  discount: string;
  total: string;
  paidAmount: string;

  notes: string | null;

  createdAt: string;
  updatedAt: string;

  customer: OrderListCustomer;

  _count: OrderCounts;
}

export interface OrderListResponse {
  data: OrderListItem[];

  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/* ============================================================
 * DETAIL
 * ============================================================ */

export interface OrderGarment {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
}

export interface OrderLogo {
  id: string;
  name: string;
  status: "ACTIVE" | "ARCHIVED";
  currentPrice: string;
  customerId: string | null;
}

export interface OrderItemLogo {
  id: string;
  orderItemId: string;
  logoId: string;

  logoName: string;
  unitPrice: string;
  quantity: number;

  notes: string | null;

  createdAt: string;

  logo: OrderLogo;
}

export interface OrderItem {
  id: string;
  orderId: string;
  garmentId: string;

  description: string | null;

  quantity: number;

  subtotal: string;

  status: OrderItemStatus;

  notes: string | null;

  createdAt: string;
  updatedAt: string;

  garment: OrderGarment;

  logos: OrderItemLogo[];
}

/* ============================================================
 * PAYMENTS
 * ============================================================ */

export interface OrderPayment {
  id: string;

  orderId: string;

  amount: string;

  paidAt: string;

  method?: string | null;

  reference?: string | null;

  notes?: string | null;

  createdAt?: string;
}

/* ============================================================
 * STATUS HISTORY
 * ============================================================ */

export interface OrderStatusHistoryUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;

  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;

  changedByUserId: string;

  notes: string | null;

  createdAt: string;

  changedBy: OrderStatusHistoryUser;
}

/* ============================================================
 * DETAIL
 * ============================================================ */

export interface OrderDetail extends OrderListItem {
  customer: OrderCustomer;

  items: OrderItem[];

  payments: OrderPayment[];

  statusHistory: OrderStatusHistory[];

  _count: OrderCounts;
}

/* ============================================================
 * CREATE
 * ============================================================ */

export interface NewOrderCustomer {
  name: string;

  email?: string;
  phone?: string;
  taxId?: string;

  companyName?: string;
  address?: string;
  city?: string;
  notes?: string;
}

export interface NewOrderLogo {
  name: string;
  currentPrice: string;

  description?: string;
}

export interface CreateOrderLogoPayload {
  /**
   * Logo existente.
   */
  logoId?: string;

  /**
   * Logo nuevo.
   */
  logo?: NewOrderLogo;

  quantity: number;

  notes?: string;
}

export interface CreateOrderItemPayload {
  garmentId: string;

  quantity: number;

  description?: string;

  notes?: string;

  logos: CreateOrderLogoPayload[];
}

export interface CreateOrderPayload {
  /**
   * Cliente existente.
   *
   * Es mutuamente excluyente con `customer`.
   */
  customerId?: string;

  /**
   * Cliente nuevo.
   *
   * Es mutuamente excluyente con `customerId`.
   */
  customer?: NewOrderCustomer;

  status?: OrderStatus;

  promisedAt?: string;

  discount?: string;

  notes?: string;

  items: CreateOrderItemPayload[];
}

/* ============================================================
 * UPDATE
 * ============================================================ */

export interface UpdateOrderPayload {
  promisedAt?: string | null;

  discount?: string;

  notes?: string | null;
}

/* ============================================================
 * STATUS
 * ============================================================ */

export interface ChangeOrderStatusPayload {
  status: OrderStatus;

  notes?: string;
}

/* ============================================================
 * FILTERS
 * ============================================================ */

export interface OrderFilters {
  page?: number;
  limit?: number;

  orderNumber?: number;

  customerId?: string;

  status?: OrderStatus;

  paymentStatus?: PaymentStatus;

  orderedFrom?: string;

  orderedTo?: string;

  promisedFrom?: string;

  promisedTo?: string;
}
