"use client";

import type { ReactNode } from "react";
import { CHART_COLORS } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { TipBody, useHoverTip } from "@/components/ui/hover-tip";

export interface BarListItem {
  key: string | number;
  label: string;
  value: number;
  valueLabel: string;
  color?: string;
  /** Keterangan tambahan di tooltip */
  detail?: string;
}

/**
 * Daftar horizontal bar: baseline nol, urutan ditentukan pemanggil, label dan
 * nilai langsung di samping batang (tanpa sumbu atau legenda). Hanya batang
 * teratas yang diberi warna aksen, sisanya abu-abu, kecuali item membawa warna
 * sendiri (misalnya warna klaster).
 */
export function BarList({
  items,
  activeKey = null,
  onSelect,
  accent = CHART_COLORS.primary,
  highlight = 1,
  labelClassName = "w-[44%] min-w-[84px] max-w-44",
  ariaLabel,
}: {
  items: BarListItem[];
  activeKey?: string | number | null;
  onSelect?: (key: string | number) => void;
  accent?: string;
  highlight?: number;
  labelClassName?: string;
  ariaLabel?: string;
}) {
  const max = Math.max(...items.map((item) => item.value), 0);
  const filtering = activeKey !== null && activeKey !== "all";
  const { bind, node } = useHoverTip();

  return (
    <>
    <ul
      aria-label={ariaLabel}
      className="group/list max-h-full space-y-1.5 overflow-y-auto"
    >
      {items.map((item, index) => {
        const pct = max > 0 ? (item.value / max) * 100 : 0;
        const color =
          item.color ?? (index < highlight ? accent : CHART_COLORS.muted);
        const dimmed = filtering && String(activeKey) !== String(item.key);

        const tip = bind(
          <TipBody
            title={item.label}
            swatch={color}
            rows={[
              { label: "Nilai", value: item.valueLabel },
              { label: "Peringkat", value: `${index + 1} dari ${items.length}` },
              ...(index > 0
                ? [{ label: "Dibanding teratas", value: `${Math.round(pct)}%` }]
                : []),
            ]}
            note={item.detail ?? (onSelect ? "Klik untuk memfilter dashboard" : undefined)}
          />,
        );

        const row = (
          <>
            <span
              className={cn(
                "shrink-0 text-sm leading-5 text-slate-700",
                labelClassName,
              )}
            >
              {item.label}
            </span>
            <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
              <span
                className="bar-grow h-5 shrink-0 rounded-sm transition-[filter,transform] duration-200 group-hover/row:brightness-90"
                style={{
                  animationDelay: `${Math.min(index, 12) * 35}ms`,
                  width:
                    pct > 0
                      ? `max(3px, calc((100% - 5.25rem) * ${(pct / 100).toFixed(4)}))`
                      : "0px",
                  backgroundColor: color,
                }}
              />
              <span className="whitespace-nowrap text-sm font-semibold text-slate-900">
                {item.valueLabel}
              </span>
            </span>
          </>
        );

        return (
          <li
            key={item.key}
            {...tip}
            className={cn(
              "group/row transition-opacity duration-200 group-hover/list:opacity-50 hover:opacity-100!",
              dimmed && "opacity-45",
            )}
          >
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(item.key)}
                className="flex w-full items-center gap-3 rounded-md px-1 py-1 text-left hover:bg-slate-50"
              >
                {row}
              </button>
            ) : (
              <div className="flex w-full items-center gap-3 px-1 py-1">
                {row}
              </div>
            )}
          </li>
        );
      })}
    </ul>
    {node}
    </>
  );
}

/** Kunci warna kecil di kiri atas grafik (menggantikan legenda di bawah). */
export function ChartKey<Id extends string | number = string>({
  items,
  focus = null,
  onFocus,
  onPick,
}: {
  items: { label: string; color: string; id?: Id }[];
  /** Item yang sedang disorot; item lain diredupkan */
  focus?: Id | null;
  onFocus?: (id: Id | null) => void;
  onPick?: (id: Id) => void;
}): ReactNode {
  const interactive = Boolean(onFocus || onPick);
  return (
    <div className="mb-3 flex flex-wrap items-center gap-x-1 gap-y-1 text-xs text-slate-600">
      {items.map((item) => {
        const body = (
          <>
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </>
        );
        const dim = focus !== null && item.id !== undefined && focus !== item.id;
        if (!interactive || item.id === undefined) {
          return (
            <span key={item.label} className="inline-flex items-center gap-1.5 px-2 py-1">
              {body}
            </span>
          );
        }
        const id = item.id;
        return (
          <button
            key={item.label}
            type="button"
            onPointerEnter={() => onFocus?.(id)}
            onPointerLeave={() => onFocus?.(null)}
            onFocus={() => onFocus?.(id)}
            onBlur={() => onFocus?.(null)}
            onClick={() => onPick?.(id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 transition hover:bg-[#F3F0EA]",
              dim && "opacity-40",
            )}
          >
            {body}
          </button>
        );
      })}
    </div>
  );
}
