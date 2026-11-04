"use client";

import { useDashboard } from "@/components/providers/dashboard-provider";
import { CLUSTER_BY_ID } from "@/lib/constants";
import { formatNumber, formatPct } from "@/lib/format";
import { cn } from "@/lib/cn";

/** Empat segmen klaster sebagai kartu kecil 2x2; klik untuk memfilter. */
export function ClusterSummaryCards() {
  const { clusterSummary, setCluster, filters } = useDashboard();
  const total = clusterSummary.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="grid h-full grid-cols-2 grid-rows-2 gap-2">
      {clusterSummary.map((item) => {
        const meta = CLUSTER_BY_ID[item.cluster];
        const active = filters.cluster === item.cluster;
        const dimmed = filters.cluster !== "all" && !active;
        const share = total > 0 ? (item.count / total) * 100 : 0;

        return (
          <button
            key={item.cluster}
            type="button"
            disabled={item.count === 0}
            onClick={() => setCluster(active ? "all" : item.cluster)}
            className={cn(
              "flex min-h-0 min-w-0 flex-col justify-between overflow-hidden rounded-2xl p-3 text-left transition disabled:opacity-50",
              active ? "ring-2 ring-[#16181D]" : "hover:brightness-95",
              dimmed && "opacity-50",
            )}
            style={{ backgroundColor: meta.soft }}
          >
            <span
              className="flex items-center gap-1.5 text-[11px] font-semibold leading-4"
              style={{ color: meta.color }}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: meta.color }}
              />
              <span className="truncate">{meta.short}</span>
            </span>
            <span className="flex items-baseline gap-1.5 whitespace-nowrap text-2xl font-semibold leading-7 text-[#16181D]">
              {formatNumber(item.count)}
              <span className="text-[11px] font-normal text-slate-600">
                wilayah · {formatPct(share, 0)}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
