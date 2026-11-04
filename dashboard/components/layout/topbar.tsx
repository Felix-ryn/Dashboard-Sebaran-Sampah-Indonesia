"use client";

import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  Database,
  MapPin,
  RotateCcw,
  Search,
  Boxes,
} from "lucide-react";
import { CLUSTER_META, NAV_ITEMS, YEAR } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { NAV_ICONS } from "@/components/layout/rail";

const pill =
  "h-11 appearance-none rounded-full bg-white text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-[#F6C21B]/60";

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

  return (
    <header className="enter-top @container flex h-11 min-w-0 shrink-0 items-center gap-2.5">
      <div
        className={cn(
          "relative w-[260px] min-w-0 shrink transition-opacity",
          !showFilters && "pointer-events-none opacity-40",
        )}
      >
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <label htmlFor="filter-search" className="sr-only">
          Cari kabupaten atau kota
        </label>
        <input
          id="filter-search"
          type="search"
          value={filters.search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari kabupaten/kota..."
          className={cn(pill, "w-full pl-11 pr-4 placeholder:text-slate-400")}
        />
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
