import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function SectionHeader({
  title,
  description,
  actions,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>

        {description && (
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
