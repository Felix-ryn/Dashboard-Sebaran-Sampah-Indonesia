"use client";

import { useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  ExpandButton,
  ExpandedProvider,
  expandedCardClass,
  useExpandable,
} from "@/components/ui/expandable";

export interface TabItem {
  key: string;
  label: string;
  description?: string;
  footer?: string;
  content: ReactNode;
}

/** Kartu bento dengan tab pill: beberapa tampilan dalam satu kartu agar tidak perlu scroll. */
export function TabCard({
  icon: Icon,
  title,
  tabs,
  className,
}: {
  icon: LucideIcon;
  title: string;
  tabs: TabItem[];
  className?: string;
}) {
  const [active, setActive] = useState(tabs[0].key);
  const tab = tabs.find((item) => item.key === active) ?? tabs[0];
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
      <header className="flex shrink-0 items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3F0EA] text-[#16181D]">
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[15px] font-semibold leading-5 text-[#16181D]">
            {title}
          </h2>
          <p
            title={tab.description}
            className="line-clamp-1 text-xs leading-4 text-slate-500"
          >
            {tab.description ?? " "}
          </p>
        </div>
        <ExpandButton expanded={expanded} onClick={toggle} />
      </header>

      <div
        role="tablist"
        className="mt-3 flex shrink-0 flex-wrap gap-1.5"
        aria-label={title}
      >
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={item.key === tab.key}
            onClick={() => setActive(item.key)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
              item.key === tab.key
                ? "bg-[#16181D] text-white"
                : "bg-[#F3F0EA] text-slate-600 hover:bg-[#E9E4DB]",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        key={tab.key}
        className={cn(
          "tab-fade @container mt-3 min-h-0 flex-1",
          expanded ? "overflow-auto" : "overflow-hidden",
        )}
      >
        <ExpandedProvider value={expanded}>{tab.content}</ExpandedProvider>
      </div>

      {tab.footer ? (
        <p
          title={tab.footer}
          className="mt-2 line-clamp-2 shrink-0 text-[11px] leading-4 text-slate-500"
        >
          {tab.footer}
        </p>
      ) : null}
    </section>
    </div>
  );
}
