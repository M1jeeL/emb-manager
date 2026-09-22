import type { LogoStatus } from "../../../types";

interface LogoStatusBadgeProps {
  status: LogoStatus;
}

export function LogoStatusBadge({ status }: LogoStatusBadgeProps) {
  const archived = status === "ARCHIVED";

  return (
    <span
      className={
        archived
          ? "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
          : "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
      }
    >
      {archived ? "Archivado" : "Activo"}
    </span>
  );
}
