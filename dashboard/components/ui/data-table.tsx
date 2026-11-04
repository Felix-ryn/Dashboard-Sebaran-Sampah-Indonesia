"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { ClusterBadge } from "@/components/ui/cluster-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CLUSTER_BY_ID } from "@/lib/constants";
import {
  formatCompactTon,
  formatDecimal,
  formatNumber,
  formatPct,
} from "@/lib/format";
import { cn } from "@/lib/cn";

type SortKey =
  | "kabKota"
  | "provinsi"
  | "cluster"
  | "penduduk"
  | "timbulanTahunan"
  | "pctTerkelola"
  | "pctTidakTerkelola"
  | "perKapita";

const COLUMNS: {
  key: SortKey;
  label: string;
  align?: "right" | "left";
  className?: string;
}[] = [
  { key: "kabKota", label: "Wilayah" },
  { key: "cluster", label: "Klaster" },
  { key: "penduduk", label: "Penduduk", align: "right" },
  { key: "timbulanTahunan", label: "Timbulan/tahun", align: "right" },
  { key: "pctTerkelola", label: "% Terkelola", align: "right" },
  { key: "pctTidakTerkelola", label: "% Tidak terkelola", align: "right" },
  { key: "perKapita", label: "Per kapita", align: "right" },
];

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: "asc" | "desc";
}) {
  if (!active) {
    return <ArrowUpDown className="h-3 w-3 text-slate-300" />;
  }
  return direction === "asc" ? (
    <ArrowUp className="h-3 w-3 text-blue-600" />
  ) : (
    <ArrowDown className="h-3 w-3 text-blue-600" />
  );
}

export function DataTable() {
  const { filteredRegions } = useDashboard();
  const [sortKey, setSortKey] = useState<SortKey>("timbulanTahunan");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const sorted = useMemo(() => {
    return [...filteredRegions].sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];
      let comparison = 0;
      if (typeof left === "number" && typeof right === "number") {
        comparison = left - right;
      } else {
        comparison = String(left).localeCompare(String(right), "id");
      }
      return direction === "asc" ? comparison : -comparison;
    });
  }, [filteredRegions, sortKey, direction]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const rows = sorted.slice(start, start + pageSize);

  const handleSort = (key: SortKey) => {
    setPage(1);
    if (sortKey === key) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDirection("desc");
    }
  };

  const handleExport = () => {
    const headers = [
      "Provinsi",
      "Kabupaten/Kota",
      "Klaster",
      "Label klaster",
      "Penduduk",
      "Timbulan tahunan (ton)",
      "Terkelola (ton)",
      "Tidak terkelola (ton)",
      "% Terkelola",
      "% Tidak terkelola",
      "Per kapita (kg/orang/hari)",
    ];
    const lines = sorted.map((region) => [
      region.provinsi,
      region.kabKota,
      region.cluster,
      region.labelCluster,
      region.penduduk,
      region.timbulanTahunan,
      region.terkelolaTon,
      region.tidakTerkelolaTon,
      region.pctTerkelola,
      region.pctTidakTerkelola,
      region.perKapita,
    ]);
    const escape = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;
    const csv = [headers, ...lines]
      .map((row) => row.map(escape).join(","))
      .join("\r\n");
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "peringkat_sampah_2025.csv";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  if (filteredRegions.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-500">
          Menampilkan{" "}
          <span className="font-semibold text-slate-800">
            {sorted.length}
          </span>{" "}
          wilayah terfilter. Klik judul kolom untuk mengurutkan.
        </p>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
        >
          <Download className="h-3.5 w-3.5" />
          Ekspor CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-[900px] w-full border-collapse text-left">
          <thead className="bg-slate-50">
            <tr>
              {COLUMNS.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "whitespace-nowrap border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500",
                    column.align === "right" && "text-right",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleSort(column.key)}
                    className={cn(
                      "inline-flex items-center gap-1 transition hover:text-blue-700",
                      column.align === "right" && "flex-row-reverse",
                    )}
                  >
                    {column.label}
                    <SortIcon
                      active={sortKey === column.key}
                      direction={direction}
                    />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((region) => (
              <tr
                key={`${region.provinsi}-${region.kabKota}`}
                className="border-b border-slate-100 last:border-0 hover:bg-blue-50/40"
              >
                <td className="px-3 py-2.5">
                  <p className="text-sm font-semibold text-slate-900">
                    {region.kabKota}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {region.provinsi}
                  </p>
                </td>
                <td className="px-3 py-2.5">
                  <ClusterBadge cluster={region.cluster} compact />
                </td>
                <td className="px-4 py-3 text-right text-sm text-slate-600">
                  {formatNumber(region.penduduk)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-slate-800">
                  {formatCompactTon(region.timbulanTahunan)}
                </td>
                <td className="px-4 py-3">
                  <div className="ml-auto w-[92px]">
                    <div className="mb-1 text-right text-xs font-semibold text-slate-800">
                      {formatPct(region.pctTerkelola)}
                    </div>
                    <ProgressBar
                      value={region.pctTerkelola}
                      color={CLUSTER_BY_ID[region.cluster].color}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-slate-700">
                  {formatPct(region.pctTidakTerkelola)}
                </td>
                <td className="px-4 py-3 text-right text-sm text-slate-600">
                  {formatDecimal(region.perKapita, 2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Baris per halaman</span>
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="ml-2">
            {start + 1}-{Math.min(start + pageSize, sorted.length)} dari{" "}
            {sorted.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={safePage <= 1}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-2 text-sm font-medium text-slate-600">
            {safePage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            disabled={safePage >= totalPages}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
            aria-label="Halaman berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
