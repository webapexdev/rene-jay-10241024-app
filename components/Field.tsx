import type { ReactNode } from "react";

type OutlinedFieldShellProps = {
  label?: string;
  icon?: ReactNode;
  onIconClick?: () => void;
  iconAriaLabel?: string;
  error?: boolean;
  children: ReactNode;
  className?: string;
};

export function OutlinedFieldShell({
  label,
  icon,
  onIconClick,
  iconAriaLabel,
  error,
  children,
  className,
}: OutlinedFieldShellProps) {
  return (
    <div
      className={`relative rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring ${error ? "border-destructive focus-within:ring-destructive/30" : "border-input"} ${className ?? ""}`}
    >
      {label ? (
        <span className="absolute -top-2.5 left-2.5 z-10 bg-background px-1 text-xs leading-none text-muted-foreground">
          {label}
        </span>
      ) : null}
      <div className="flex items-center gap-2 px-3 py-2.5">
        {icon ? (
          onIconClick ? (
            <button
              type="button"
              onClick={onIconClick}
              className="flex shrink-0 cursor-pointer items-center text-brand"
              aria-label={iconAriaLabel ?? "Open picker"}
            >
              {icon}
            </button>
          ) : (
            <span className="flex shrink-0 items-center text-brand">{icon}</span>
          )
        ) : null}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

type FieldProps = {
  label?: string;
  icon?: ReactNode;
  onIconClick?: () => void;
  iconAriaLabel?: string;
  children: ReactNode;
  className?: string;
  error?: string;
};

export function Field({
  label,
  icon,
  onIconClick,
  iconAriaLabel,
  children,
  className,
  error,
}: FieldProps) {
  return (
    <div className={`${label ? "mt-1" : ""} ${className ?? ""}`}>
      <OutlinedFieldShell
        label={label || undefined}
        icon={icon}
        onIconClick={onIconClick}
        iconAriaLabel={iconAriaLabel}
        error={!!error}
      >
        {children}
      </OutlinedFieldShell>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
