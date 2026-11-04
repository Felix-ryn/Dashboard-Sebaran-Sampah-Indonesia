"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  Database,
  MapPin,
  RotateCcw,
  Search,
  Boxes,
  X,
} from "lucide-react";
import { CLUSTER_META, NAV_ITEMS, YEAR } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { NAV_ICONS } from "@/components/layout/rail";
import { ThemeToggle, type Theme } from "@/components/ui/curtain-theme-toggle";

function saveTheme(theme: Theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch {}
}

const pill =
  "h-11 appearance-none rounded-full bg-white text-sm text-slate-700 outline-none ring-1 ring-black/[0.05] transition focus:ring-2 focus:ring-[#F6C21B]/60";

export function Topbar() {
  const pathname = usePathname();
  const {
    filters,
    setProvinsi,
    setCluster,
    setSearch,
    resetFilters,
    activeFilterCount,
    filteredRegions,
    data,
    provincesList,
  } = useDashboard();

  const current =
    NAV_ITEMS.find((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
    ) ?? NAV_ITEMS[0];
  const CurrentIcon = NAV_ICONS[current.icon];
  const showFilters = true;

  // Pencarian: awalnya hanya ikon kaca pembesar, melebar saat diklik.
  // Tetap terbuka selama ada teks pencarian, menutup bila kosong dan kehilangan fokus.
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const expanded = searchOpen || filters.search !== "";

  const openSearch = () => {
    setSearchOpen(true);
    requestAnimationFrame(() => searchInput.current?.focus());
  };

  // Tekan "/" di mana saja untuk membuka pencarian
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;
      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setSearchOpen(true);
        requestAnimationFrame(() => searchInput.current?.focus());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="enter-top @container flex h-11 min-w-0 shrink-0 items-center gap-2.5">
      <div
        className={cn(
          "group/search relative h-11 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-black/[0.05]",
          "transition-[width,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-within:ring-2 focus-within:ring-[#F6C21B]/60",
          expanded ? "w-[260px]" : "w-11 hover:shadow-[0_4px_14px_rgba(22,24,29,0.10)]",
        )}
      >
        <Search
          className={cn(
            "pointer-events-none absolute left-[14px] top-1/2 z-10 h-4 w-4 -translate-y-1/2 transition-colors duration-300",
            expanded ? "text-slate-400" : "text-slate-600 group-hover/search:text-slate-900",
          )}
        />
        {!expanded ? (
          <button
            type="button"
            onClick={openSearch}
            aria-label="Buka pencarian kabupaten atau kota"
            title="Cari (tekan /)"
            className="absolute inset-0 z-20 rounded-full"
          />
        ) : null}
        <label htmlFor="filter-search" className="sr-only">
          Cari kabupaten atau kota
        </label>
        <input
          id="filter-search"
          ref={searchInput}
          type="text"
          value={filters.search}
          tabIndex={expanded ? 0 : -1}
          onChange={(event) => setSearch(event.target.value)}
          onBlur={() => {
            if (filters.search === "") setSearchOpen(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setSearch("");
              setSearchOpen(false);
              event.currentTarget.blur();
            }
          }}
          placeholder="Cari kabupaten/kota..."
          autoComplete="off"
          className={cn(
            "absolute inset-0 h-11 w-full bg-transparent pl-11 pr-10 text-sm text-slate-700 outline-none placeholder:text-slate-400",
            "transition-opacity duration-300",
            expanded ? "opacity-100 delay-150" : "pointer-events-none opacity-0",
          )}
        />
        {expanded && filters.search !== "" ? (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              searchInput.current?.focus();
            }}
            aria-label="Hapus pencarian"
            className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        ) : null}
      </div>

      {showFilters ? (
        <>
          <div className="relative hidden @[1000px]:block">
            <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <label htmlFor="filter-provinsi" className="sr-only">
              Filter provinsi
            </label>
            <select
              id="filter-provinsi"
              value={filters.provinsi}
              onChange={(event) => setProvinsi(event.target.value)}
              className={cn(pill, "w-[190px] pl-11 pr-9")}
            >
              <option value="all">Semua provinsi</option>
              {provincesList.map((provinsi) => (
                <option key={provinsi} value={provinsi}>
                  {provinsi}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative hidden @[1000px]:block">
            <Boxes className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <label htmlFor="filter-cluster" className="sr-only">
              Filter klaster
            </label>
            <select
              id="filter-cluster"
              value={filters.cluster === "all" ? "all" : String(filters.cluster)}
              onChange={(event) => {
                const value = event.target.value;
                setCluster(value === "all" ? "all" : (Number(value) as 0 | 1 | 2 | 3));
              }}
              className={cn(pill, "w-[190px] pl-11 pr-9")}
            >
              <option value="all">Semua klaster</option>
              {CLUSTER_META.map((cluster) => (
                <option key={cluster.id} value={cluster.id}>
                  {cluster.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <button
            type="button"
            onClick={resetFilters}
            disabled={activeFilterCount === 0}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition",
              activeFilterCount > 0
                ? "bg-[#F6C21B] text-[#16181D] hover:brightness-95"
                : "pointer-events-none bg-white/60 text-slate-400",
            )}
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden @[1250px]:inline">Reset</span>
            {activeFilterCount > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#16181D] px-1.5 text-[11px] font-semibold text-white">
                {activeFilterCount}
              </span>
            ) : null}
          </button>

          <span className="hidden whitespace-nowrap rounded-full bg-white/60 px-4 py-3 text-sm text-slate-600 @[760px]:inline">
            <span className="font-semibold text-slate-900">
              {filteredRegions.length}
            </span>{" "}
            / {data.regions.length} wilayah
          </span>
        </>
      ) : null}

      <div className="ml-auto flex shrink-0 items-center gap-2.5">
        <ThemeToggle variant="icon" buttonSize={44} duration={600} onThemeChange={saveTheme} />
        <span className="hidden h-11 items-center gap-2 whitespace-nowrap rounded-full bg-white px-4 text-sm font-medium text-slate-600 @[1500px]:inline-flex">
          <CalendarDays className="h-4 w-4 text-slate-400" />
          Data {YEAR}
        </span>
        <span className="hidden h-11 items-center gap-2 whitespace-nowrap rounded-full bg-white px-4 text-sm font-medium text-slate-600 @[1500px]:inline-flex">
          <Database className="h-4 w-4 text-slate-400" />
          SIPSN KLHK
        </span>
        <span className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-[#16181D] px-5 text-sm font-semibold text-white">
          <CurrentIcon className="h-4 w-4 text-[#F6C21B]" />
          {current.label}
        </span>
      </div>
    </header>
  );
}
