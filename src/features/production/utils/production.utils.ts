import type { ProductionJobStatus } from "../../../types";

export const productionStatusLabels: Record<ProductionJobStatus, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En producción",
  PAUSED: "Pausada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

export const productionStatusClasses: Record<ProductionJobStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",

  IN_PROGRESS: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",

  PAUSED: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20",

  COMPLETED:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",

  CANCELLED: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
};

export function getProductionStatusLabel(status: ProductionJobStatus) {
  return productionStatusLabels[status];
}

export function getProductionStatusClass(status: ProductionJobStatus) {
  return productionStatusClasses[status];
}

export function formatProductionDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getEmployeeName(
  employee: {
    firstName: string;
    lastName: string;
  } | null,
) {
  if (!employee) {
    return "Sin asignar";
  }

  return `${employee.firstName} ${employee.lastName}`;
}
