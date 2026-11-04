"use client";

import { Boxes } from "lucide-react";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { ClusterBadge } from "@/components/ui/cluster-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CLUSTER_BY_ID } from "@/lib/constants";
import { formatNumber, formatPct } from "@/lib/format";

export function ClusterSummaryCards() {
  const { clusterSummary, setCluster, filters } = useDashboard();
  const total = clusterSummary.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {clusterSummary.map((item) => {
        const meta = CLUSTER_BY_ID[item.cluster];
        const active = filters.cluster === item.cluster;
        const share = total > 0 ? (item.count / total) * 100 : 0;

        return (
          <button
            key={item.cluster}
            type="button"
            disabled={item.count === 0}
            onClick={() =>
              setCluster(active ? "all" : item.cluster)
            }
            className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm ${
              active
                ? "border-blue-300 ring-2 ring-blue-100"
                : "border-slate-200/80"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <ClusterBadge cluster={item.cluster} compact />
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ backgroundColor: meta.soft, color: meta.color }}
              >
                <Boxes className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="mt-4 text-2xl font-semibold text-slate-950">
              {formatNumber(item.count)}
              <span className="ml-1 text-sm font-normal text-slate-500">
                wilayah
              </span>
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {formatPct(share)} dari total
            </p>
            <ProgressBar
              value={share}
              color={meta.color}
              className="mt-3"
            />
          </button>
        );
      })}
    </div>
  );
}
