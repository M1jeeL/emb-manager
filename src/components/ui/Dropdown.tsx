import { useEffect, useRef, useState, type ReactNode } from "react";

export interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
}

export function Dropdown({ trigger, items, align = "right" }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  function handleItemClick(item: DropdownItem) {
    if (item.disabled) {
      return;
    }

    setOpen(false);
    item.onClick();
  }

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen((current) => !current);
          }
        }}
      >
        {trigger}
      </div>

      {open && (
        <div
          className={[
            "absolute z-40 mt-2 min-w-48 overflow-hidden rounded-lg",
            "border border-slate-200 bg-white py-1 shadow-lg",
            align === "right" ? "right-0" : "left-0",
          ].join(" ")}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={item.disabled}
              onClick={() => handleItemClick(item)}
              className={[
                "flex w-full items-center gap-2 px-4 py-2 text-left text-sm",
                "transition-colors",
                item.danger
                  ? "text-red-600 hover:bg-red-50"
                  : "text-slate-700 hover:bg-slate-50",
                "disabled:cursor-not-allowed disabled:opacity-50",
              ].join(" ")}
            >
              {item.icon}

              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
