import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

const TONES = {
  blue: "bg-blue-50 text-blue-600",
  navy: "bg-indigo-50 text-indigo-700",
  sky: "bg-sky-50 text-sky-600",
  teal: "bg-teal-50 text-teal-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
} as const;

export type KpiTone = keyof typeof TONES;

export function KpiCard({
  icon: Icon,
  label,
  value,
  helper,
  tone = "blue",
  footer,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  helper?: string;
  tone?: KpiTone;
  footer?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-400 opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-3 break-words text-2xl font-semibold leading-tight tracking-tight text-slate-950">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            TONES[tone],
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
      </div>
      {helper ? (
        <p className="mt-3 text-sm leading-6 text-slate-500">{helper}</p>
      ) : null}
      {footer ? (
        <p className="mt-3 border-t border-slate-100 pt-3 text-sm font-medium text-slate-600">
          {footer}
        </p>
      ) : null}
    </div>
  );
}
