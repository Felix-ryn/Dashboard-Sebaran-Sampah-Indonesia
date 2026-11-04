"use client";

import { MapPin } from "lucide-react";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { ClusterBadge } from "@/components/ui/cluster-badge";
import { CLUSTER_META } from "@/lib/constants";
import { formatCompactTon, formatNumber } from "@/lib/format";

export function ClusterExamples() {
  const { filteredRegions, setCluster, setSearch } = useDashboard();

  return (
    <div className="grid max-h-full gap-2 overflow-y-auto @sm:grid-cols-2">
      {CLUSTER_META.map((meta) => {
        const regions = filteredRegions
          .filter((region) => region.cluster === meta.id)
          .sort((a, b) => b.timbulanTahunan - a.timbulanTahunan)
          .slice(0, 3);

        if (regions.length === 0) return null;

        return (
          <div
            key={meta.id}
            className="rounded-2xl bg-[#F7F8FA] p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <ClusterBadge cluster={meta.id} compact />
              <span className="text-xs font-medium text-slate-400">
                {formatNumber(
                  filteredRegions.filter(
                    (region) => region.cluster === meta.id,
                  ).length,
                )}{" "}
                wilayah
              </span>
            </div>
            <div className="mt-2.5 space-y-1">
              {regions.map((region) => (
                <button
                  key={`${region.provinsi}-${region.kabKota}`}
                  type="button"
                  onClick={() => {
                    setCluster(meta.id);
                    setSearch(region.kabKota);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-white"
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                    <span className="truncate text-sm font-medium text-slate-700">
                      {region.kabKota}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-slate-500">
                    {formatCompactTon(region.timbulanTahunan)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
