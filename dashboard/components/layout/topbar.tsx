"use client";

import { usePathname } from "next/navigation";
import { CalendarDays, Database, Menu } from "lucide-react";
import { NAV_ITEMS, YEAR } from "@/lib/constants";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const current =
    NAV_ITEMS.find((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
    ) ?? NAV_ITEMS[0];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="flex h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenu}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
          aria-label="Buka menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Dashboard analitik
          </p>
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-semibold text-slate-950">
              {current.label}
            </h1>
            <span className="hidden truncate text-sm text-slate-500 md:block">
              {current.description}
            </span>
          </div>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
            <CalendarDays className="h-4 w-4 text-blue-600" />
            Data {YEAR}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
            <Database className="h-4 w-4" />
            SIPSN KLHK
          </span>
        </div>
      </div>
    </header>
  );
}
