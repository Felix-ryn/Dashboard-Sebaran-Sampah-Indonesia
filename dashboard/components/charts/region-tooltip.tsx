"use client";

import type { TooltipContentProps } from "recharts";
import { CLUSTER_BY_ID } from "@/lib/constants";
import {
  formatCompactTon,
  formatNumber,
  formatPct,
  formatPerKapita,
} from "@/lib/format";
import type { Region } from "@/lib/types";

export function RegionTooltip({
  active,
  payload,
  showCluster = true,
}: Partial<TooltipContentProps> & { showCluster?: boolean }) {
  if (!active || !payload?.length) return null;
  const region = payload[0]?.payload as Region | undefined;
  if (!region) return null;
  const cluster = CLUSTER_BY_ID[region.cluster];

  return (
    <div className="min-w-[210px] rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-xl">
      <p className="text-sm font-semibold text-slate-950">{region.kabKota}</p>
      <p className="mt-0.5 text-[11px] text-slate-500">{region.provinsi}</p>
      {showCluster ? (
        <span
          className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ backgroundColor: cluster.soft, color: cluster.color }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: cluster.color }}
          />
          {cluster.label}
        </span>
      ) : null}
      <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2.5 text-[11px] text-slate-600">
        <div className="flex items-center justify-between gap-4">
          <span>Timbulan tahunan</span>
          <span className="font-semibold text-slate-900">
            {formatCompactTon(region.timbulanTahunan)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Terkelola</span>
          <span className="font-semibold text-slate-900">
            {formatPct(region.pctTerkelola)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Tidak terkelola</span>
          <span className="font-semibold text-slate-900">
            {formatPct(region.pctTidakTerkelola)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Per kapita</span>
          <span className="font-semibold text-slate-900">
            {formatPerKapita(region.perKapita)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Penduduk</span>
          <span className="font-semibold text-slate-900">
            {formatNumber(region.penduduk)} jiwa
          </span>
        </div>
      </div>
    </div>
  );
}
