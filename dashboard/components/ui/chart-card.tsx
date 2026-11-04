"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  ExpandButton,
  ExpandedProvider,
  expandedCardClass,
  useExpandable,
} from "@/components/ui/expandable";

/**
 * Kartu bento putih: ikon bulat + judul di kiri atas, isi mengisi sisa tinggi
 * (min-h-0 agar chart ikut menyesuaikan dan halaman tidak perlu di-scroll).
 */
export function ChartCard({
  icon: Icon,
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
  footer,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  footer?: string;
}) {
  const { cardRef, expanded, rect, toggle } = useExpandable();

  return (
    <div className={cn("relative min-h-0 min-w-0", className)}>
    <section
      ref={cardRef}
      data-anim="card"
      style={expanded ? rect : undefined}
      className={cn(
        "flex min-w-0 flex-col rounded-[28px] border border-black/[0.05] bg-white p-4",
        expanded ? expandedCardClass : "h-full min-h-0",
      )}
    >
      <header className="flex shrink-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3F0EA] text-[#16181D]">
            <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-semibold leading-5 text-[#16181D]">
              {title}
            </h2>
            {description ? (
              <p
                title={description}
                className="line-clamp-1 text-xs leading-4 text-slate-500"
              >
                {description}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action}
          <ExpandButton expanded={expanded} onClick={toggle} />
        </div>
      </header>
      <div
        className={cn(
          "@container mt-3 min-h-0 flex-1",
          expanded ? "overflow-auto" : "overflow-hidden",
          bodyClassName,
        )}
      >
        <ExpandedProvider value={expanded}>{children}</ExpandedProvider>
      </div>
      {footer ? (
        <p
          title={footer}
          className="mt-2 line-clamp-2 shrink-0 text-[11px] leading-4 text-slate-500"
        >
          {footer}
        </p>
      ) : null}
    </section>
    </div>
  );
}
