export interface DashboardPeriod {
  from: string;
  to: string;
  previousFrom: string;
  previousTo: string;
}

export interface DashboardQuery {
  from?: string;
  to?: string;
}

// ============================================================
// OVERVIEW
// ============================================================

export interface DashboardSalesOverview {
  revenue: string;
  paid: string;
  averageOrderValue: string;
  revenueVariationPercent: number | null;
  paidVariationPercent: number | null;
  ordersVariationPercent: number | null;
}

export interface DashboardOrdersPeriod {
  created: number;
  delivered: number;
  cancelled: number;
}

export interface DashboardCustomersPeriod {
  newCustomers: number;
}

export interface DashboardCurrentOrders {
  quotes: number;
  pending: number;
  inProgress: number;
  ready: number;
  overdue: number;
}

export interface DashboardReceivables {
  amount: string;
  orders: number;
}

export interface DashboardCurrentProduction {
  pendingJobs: number;
  inProgressJobs: number;
  pausedJobs: number;
  pendingUnits: number;
  inProgressUnits: number;
}

export interface DashboardCurrentMachines {
  active: number;
  maintenance: number;
  inactive: number;
}

export interface DashboardOverviewResponse {
  period: DashboardPeriod;

  periodMetrics: {
    sales: DashboardSalesOverview;
    orders: DashboardOrdersPeriod;
    customers: DashboardCustomersPeriod;
  };

  current: {
    orders: DashboardCurrentOrders;
    receivables: DashboardReceivables;
    production: DashboardCurrentProduction;
    machines: DashboardCurrentMachines;
  };
}

// ============================================================
// SALES
// ============================================================

export interface DashboardSalesSummary {
  revenue: string;
  paid: string;
  averageOrderValue: string;
  orders: number;
  revenueVariationPercent: number | null;
  paidVariationPercent: number | null;
  ordersVariationPercent: number | null;
}

export interface DashboardSalesDaily {
  date: string;
  revenue: string;
  paid: string;
  orders: number;
}

export interface DashboardSalesPaymentMethod {
  method: string;
  amount: string;
  payments: number;
  percentage: number;
}

export interface DashboardSalesResponse {
  period: DashboardPeriod;

  summary: DashboardSalesSummary;

  daily: DashboardSalesDaily[];

  paymentMethods: DashboardSalesPaymentMethod[];
}

// ============================================================
// OPERATIONS
// ============================================================

export interface DashboardOperationsSummary {
  activeOrders: number;
  pending: number;
  inProgress: number;
  ready: number;
  overdue: number;
  dueToday: number;
  dueNext7Days: number;
}

export interface DashboardOperationsFulfillment {
  delivered: number;
  deliveredOnTime: number;
  deliveredLate: number;
  onTimeRatePercent: number | null;
  averageTurnaroundHours: number | null;
}

export interface DashboardUpcomingOrder {
  id: string;
  orderNumber: number;

  customer: {
    id: string;
    name: string;
    companyName: string | null;
  };

  status: string;
  paymentStatus: string;
  promisedAt: string;
  total: string;
  paidAmount: string;
}

export interface DashboardOperationsResponse {
  period: DashboardPeriod;

  summary: DashboardOperationsSummary;

  fulfillment: DashboardOperationsFulfillment;

  upcoming: DashboardUpcomingOrder[];
}

// ============================================================
// PRODUCTION
// ============================================================

export interface DashboardProductionSummary {
  pendingJobs: number;
  inProgressJobs: number;
  pausedJobs: number;
  completedJobs: number;
  cancelledJobs: number;

  pendingUnits: number;
  inProgressUnits: number;
  pausedUnits: number;
  completedUnits: number;
}

export interface DashboardProductionPerformance {
  completedJobs: number;
  completedUnits: number;
  averageCompletionHours: number | null;
}

export interface DashboardProductionMachine {
  machineId: string;
  machineName: string;
  machineCode: string | null;
  activeJobs: number;
  activeUnits: number;
}

export interface DashboardProductionEmployee {
  employeeId: string;
  employeeName: string;
  activeJobs: number;
  activeUnits: number;
}

export interface DashboardProductionResponse {
  period: DashboardPeriod;

  summary: DashboardProductionSummary;

  performance: DashboardProductionPerformance;

  machines: DashboardProductionMachine[];

  employees: DashboardProductionEmployee[];
}

// ============================================================
// CUSTOMERS
// ============================================================

export interface DashboardCustomersSummary {
  total: number;
  newCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
}

export interface DashboardTopCustomer {
  customerId: string;
  name: string;
  companyName: string | null;
  orders: number;
  revenue: string;
  pendingAmount: string;
}

export interface DashboardCustomersResponse {
  period: DashboardPeriod;

  summary: DashboardCustomersSummary;

  topCustomers: DashboardTopCustomer[];
}

// ============================================================
// ALERTS
// ============================================================

export type DashboardAlertSeverity = "CRITICAL" | "WARNING" | "INFO";

export type DashboardAlertType =
  | "OVERDUE_ORDER"
  | "UPCOMING_DELIVERY"
  | "PRODUCTION_BACKLOG"
  | "MACHINE_MAINTENANCE"
  | "RECEIVABLE";

export interface DashboardAlert {
  type: DashboardAlertType;
  severity: DashboardAlertSeverity;
  title: string;
  description: string;
  count: number;
  amount?: string;
}

export interface DashboardAlertsResponse {
  alerts: DashboardAlert[];
}
