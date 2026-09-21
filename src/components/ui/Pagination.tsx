import { Select } from "./Select";
import { Button } from "./Button";

interface PaginationProps {
  page: number;
  totalPages: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  pageSizeOptions?: number[];
}

export function Pagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  pageSizeOptions = [10, 20, 50, 100],
}: PaginationProps) {
  if (total === 0) {
    return null;
  }

  const currentPage = Math.min(page, totalPages);

  const from = total === 0 ? 0 : (currentPage - 1) * limit + 1;

  const to = total === 0 ? 0 : Math.min(currentPage * limit, total);

  const canPrevious = currentPage > 1;
  const canNext = currentPage < totalPages;

  function handleLimitChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextLimit = Number(event.target.value);

    onLimitChange?.(nextLimit);
  }

  return (
    <div className="flex flex-col gap-4 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center">
        <p>
          Mostrando <span className="font-medium text-slate-700">{from}</span> a{" "}
          <span className="font-medium text-slate-700">{to}</span> de{" "}
          <span className="font-medium text-slate-700">{total}</span>
        </p>
        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-sm text-slate-500">
              Mostrar
            </span>

            <Select
              value={String(limit)}
              onChange={handleLimitChange}
              options={pageSizeOptions.map((size) => ({
                value: String(size),
                label: String(size),
              }))}
              className="w-20"
            />
            <span className="whitespace-nowrap text-sm text-slate-500">
              por p&aacute;gina
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!canPrevious}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Anterior
          </Button>

          <span className="min-w-20 text-center text-sm text-slate-600">
            {currentPage} de {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={!canNext}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
