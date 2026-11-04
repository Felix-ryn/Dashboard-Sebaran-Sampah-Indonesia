"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Boxes,
  LayoutDashboard,
  ListOrdered,
  PieChart,
  Recycle,
  Truck,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import { APP_NAME, APP_SUBTITLE, NAV_ITEMS, type NavIcon } from "@/lib/constants";
import { cn } from "@/lib/cn";

const ICONS: Record<NavIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  gap: TriangleAlert,
  cluster: Boxes,
  composition: PieChart,
  source: Truck,
  ranking: ListOrdered,
  method: BookOpen,
};

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col text-slate-300 transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        style={{
          background:
            "linear-gradient(180deg, #0B1B33 0%, #0F2A4A 62%, #102F53 100%)",
        }}
      >
        <div className="flex items-center justify-between px-5 pb-5 pt-6">
          <Link href="/" className="flex items-center gap-3" onClick={onClose}>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-950/40">
              <Recycle className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <span>
              <span className="block text-base font-semibold tracking-tight text-white">
                {APP_NAME}
              </span>
              <span className="mt-0.5 block text-xs uppercase tracking-[0.16em] text-slate-400">
                {APP_SUBTITLE}
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-3">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Menu utama
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = ICONS[item.icon];
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl border-l-2 px-3 py-3 text-sm transition",
                    active
                      ? "border-blue-400 bg-white/10 font-semibold text-white shadow-sm"
                      : "border-transparent text-slate-400 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition",
                      active
                        ? "text-blue-300"
                        : "text-slate-500 group-hover:text-blue-300",
                    )}
                    strokeWidth={2}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto px-4 pb-5 pt-6">
          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Sumber data
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              SIPSN KLHK 2025
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              327 kabupaten/kota, 37 provinsi. Periode data satu tahun.
            </p>
          </div>
          <p className="mt-4 px-1 text-xs leading-5 text-slate-500">
            Proyek Data Storytelling
            <br />
            Dashboard analitik pengelolaan sampah
          </p>
        </div>
      </aside>
    </>
  );
}
