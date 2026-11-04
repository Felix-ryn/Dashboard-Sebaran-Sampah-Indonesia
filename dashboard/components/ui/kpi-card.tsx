import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

const TONES = {
  blue: "bg-[#F1F3F6] text-[#16181D]",
  navy: "bg-[#F1F3F6] text-[#16181D]",
  sky: "bg-[#F1F3F6] text-[#16181D]",
  teal: "bg-[#F1F3F6] text-[#16181D]",
  amber: "bg-[#FBEFD0] text-[#8A5A00]",
  rose: "bg-[#FBE6D8] text-[#B04A00]",
} as const;

export type KpiTone = keyof typeof TONES;

/** Kartu angka ringkas. `dark` = kartu hitam sebagai angka utama halaman. */
export function KpiCard({
  icon: Icon,
  label,
  value,
  helper,
  tone = "blue",
  dark = false,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  helper?: string;
  tone?: KpiTone;
  dark?: boolean;
  className?: string;
  footer?: string;
}) {
  return (
    <div
      data-anim="card"
      className={cn(
        "flex min-w-0 flex-col justify-between rounded-[28px] p-4 transition-transform duration-300 hover:-translate-y-0.5",
        dark ? "bg-[#16181D] text-white" : "border border-black/[0.05] bg-white text-[#16181D]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            "text-[11px] font-semibold uppercase leading-4 tracking-wide",
            dark ? "text-slate-400" : "text-slate-500",
          )}
        >
          {label}
        </p>
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            dark ? "bg-[#F6C21B] text-[#16181D]" : TONES[tone],
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
      <div className="min-w-0">
        <p
          title={value}
          className="mt-1 truncate text-xl font-semibold leading-7 tracking-tight"
        >
          {value}
        </p>
        {helper ? (
          <p
            title={helper}
            className={cn(
              "line-clamp-1 text-xs leading-4",
              dark ? "text-slate-400" : "text-slate-500",
            )}
          >
            {helper}
          </p>
        ) : null}
      </div>
    </div>
  );
}
