"use client";

import { usePathname } from "next/navigation";
import {
  Boxes,
  ChevronDown,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { CLUSTER_META } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { useDashboard } from "@/components/providers/dashboard-provider";

const selectClass =
  "h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

export function FilterBar() {
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

  if (pathname === "/metodologi") return null;

  return (
    <div className="border-b border-slate-200/80 bg-white/70">
      <div className="flex flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:px-8">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <SlidersHorizontal className="h-4 w-4 text-blue-600" />
          <span className="hidden sm:inline">Filter</span>
          {activeFilterCount > 0 ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </div>

        <div className="grid flex-1 grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-[minmax(180px,240px)_minmax(180px,240px)_minmax(220px,1fr)]">
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <label htmlFor="filter-provinsi" className="sr-only">
              Filter provinsi
            </label>
            <select
              id="filter-provinsi"
              value={filters.provinsi}
              onChange={(event) => setProvinsi(event.target.value)}
              className={selectClass}
            >
              <option value="all">Semua provinsi</option>
              {provincesList.map((provinsi) => (
                <option key={provinsi} value={provinsi}>
                  {provinsi}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative">
            <Boxes className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
              className={selectClass}
            >
              <option value="all">Semua klaster</option>
              {CLUSTER_META.map((cluster) => (
                <option key={cluster.id} value={cluster.id}>
                  {cluster.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <label htmlFor="filter-search" className="sr-only">
              Cari kabupaten atau kota
            </label>
            <input
              id="filter-search"
              type="search"
              value={filters.search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari kabupaten/kota atau provinsi..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <span className="whitespace-nowrap text-xs text-slate-500">
            <span className="font-semibold text-slate-800">
              {filteredRegions.length}
            </span>{" "}
            dari {data.regions.length} wilayah
          </span>
          <button
            type="button"
            onClick={resetFilters}
            disabled={activeFilterCount === 0}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-semibold transition",
              activeFilterCount > 0
                ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400",
            )}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
