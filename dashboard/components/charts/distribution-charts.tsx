"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { EmptyState } from "@/components/ui/empty-state";
import {
  axisTick,
  cartesianGrid,
  tooltipContentStyle,
  tooltipItemStyle,
} from "@/components/charts/chart-theme";
import { formatNumber, formatPct } from "@/lib/format";
import type { Region } from "@/lib/types";

interface Bin {
  label: string;
  min: number;
  max: number;
  color: string;
}

function buildDistribution(
  regions: Region[],
  valueOf: (region: Region) => number,
  bins: Bin[],
) {
  const total = regions.length;
  return bins.map((bin) => {
    const count = regions.filter((region) => {
      const value = valueOf(region);
      return value >= bin.min && value < bin.max;
    }).length;
    return {
      ...bin,
      count,
      share: total > 0 ? (count / total) * 100 : 0,
    };
  });
}

function DistributionChart({
  data,
}: {
  data: { label: string; count: number; share: number; color: string }[];
}) {
  if (data.every((item) => item.count === 0)) {
    return <EmptyState />;
  }

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 28, right: 8, left: 0, bottom: 4 }}
          barCategoryGap={18}
        >
          <CartesianGrid vertical={false} {...cartesianGrid} />
          <XAxis
            dataKey="label"
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <YAxis
            allowDecimals={false}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            width={42}
          />
          <Tooltip
            contentStyle={tooltipContentStyle}
            itemStyle={tooltipItemStyle}
            formatter={(value, _name, item) => {
              const payload = item.payload as {
                share?: number;
              };
              return [
                `${formatNumber(Number(value))} wilayah (${formatPct(
                  payload.share ?? 0,
                )})`,
                "Jumlah wilayah",
              ];
            }}
            cursor={{ fill: "rgba(37, 99, 235, 0.06)" }}
          />
          <Bar dataKey="count" radius={[7, 7, 0, 0]} barSize={44}>
            {data.map((entry) => (
              <Cell key={entry.label} fill={entry.color} />
            ))}
            <LabelList
              dataKey="count"
              position="top"
              fontSize={12}
              fontWeight={600}
              fill="#475569"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ManagementDistribution() {
  const { filteredRegions } = useDashboard();
  const data = useMemo(
    () =>
      buildDistribution(
        filteredRegions,
        (region) => region.pctTerkelola,
        [
          { label: "0-20%", min: 0, max: 20, color: "#E11D48" },
          { label: "20-40%", min: 20, max: 40, color: "#F59E0B" },
          { label: "40-60%", min: 40, max: 60, color: "#0EA5E9" },
          { label: "60-80%", min: 60, max: 80, color: "#14B8A6" },
          { label: "80-100%", min: 80, max: Infinity, color: "#2563EB" },
        ],
      ),
    [filteredRegions],
  );

  return <DistributionChart data={data} />;
}

export function GapDistribution() {
  const { filteredRegions } = useDashboard();
  const data = useMemo(
    () =>
      buildDistribution(
        filteredRegions,
        (region) => region.pctTidakTerkelola,
        [
          { label: "0-20%", min: 0, max: 20, color: "#14B8A6" },
          { label: "20-40%", min: 20, max: 40, color: "#0EA5E9" },
          { label: "40-60%", min: 40, max: 60, color: "#F59E0B" },
          { label: "60-80%", min: 60, max: 80, color: "#F97316" },
          { label: "80-100%", min: 80, max: Infinity, color: "#E11D48" },
        ],
      ),
    [filteredRegions],
  );

  return <DistributionChart data={data} />;
}
