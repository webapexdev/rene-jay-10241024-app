import type { ReactNode } from "react";

export type ToggleOption = {
  value: string;
  label: string;
  icon?: ReactNode;
};

type ToggleProps = {
  options: ToggleOption[];
  value: string;
  onChange: (v: string) => void;
  small?: boolean;
};

function segmentButtonClass(
  active: boolean,
  index: number,
  total: number,
): string {
  const isFirst = index === 0;
  const isLast = index === total - 1;

  if (active) {
    const corners = isFirst && isLast
      ? "rounded-[7px]"
      : isFirst
        ? "rounded-l-[7px]"
        : isLast
          ? "rounded-r-[7px]"
          : "";
    return `relative z-10 -m-px border-2 border-brand bg-brand-soft text-brand ${corners}`;
  }

  return "bg-background text-muted-foreground [&_svg]:text-muted-foreground";
}

export function Toggle({ options, value, onChange, small }: ToggleProps) {
  return (
    <div
      className={`inline-flex overflow-hidden rounded-lg border border-border bg-background ${small ? "" : "w-full"}`}
    >
      {options.map((o, i) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 font-medium transition-colors ${small ? "px-4 py-1.5 text-xs" : "px-4 py-2.5 text-sm"} ${segmentButtonClass(active, i, options.length)}`}
          >
            {o.icon}
            <span>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
