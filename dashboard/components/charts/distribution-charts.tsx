"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ResponsiveContainer } from "@/components/charts/responsive";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { EmptyState } from "@/components/ui/empty-state";
import {
  axisTick,
  tooltipContentStyle,
  tooltipItemStyle,
} from "@/components/charts/chart-theme";
import { useHover } from "@/components/charts/use-hover";
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
  xTitle,
}: {
  data: { label: string; count: number; share: number; color: string }[];
  xTitle: string;
}) {
  const hover = useHover();

  if (data.every((item) => item.count === 0)) {
    return <EmptyState />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Jumlah wilayah
      </p>
      <div className="min-h-0 w-full flex-1">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 28, right: 8, left: 0, bottom: 4 }}
          barCategoryGap={18}
        >
          <XAxis
            dataKey="label"
            tickFormatter={(value) => String(value).replace("%", "")}
            tick={{ ...axisTick, fontSize: 11 }}
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
            cursor={{ fill: "rgba(22, 24, 29, 0.05)" }}
          />
          <Bar
            isAnimationActive={false}
            {...hover.handlers}
            dataKey="count"
            radius={[7, 7, 0, 0]}
            barSize={44}
          >
            {data.map((entry, index) => (
              <Cell key={entry.label} fill={entry.color} fillOpacity={hover.dim(index)} />
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
      <p className="mt-1 text-center text-xs text-slate-500">{xTitle}</p>
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
          { label: "0-20%", min: 0, max: 20, color: "#BFD9EA" },
          { label: "20-40%", min: 20, max: 40, color: "#8FBEDB" },
          { label: "40-60%", min: 40, max: 60, color: "#5FA3CC" },
          { label: "60-80%", min: 60, max: 80, color: "#2F88BD" },
          { label: "80-100%", min: 80, max: Infinity, color: "#0072B2" },
        ],
      ),
    [filteredRegions],
  );

  return (
    <DistributionChart
      data={data}
      xTitle="% sampah terkelola di tiap wilayah"
    />
  );
}

export function GapDistribution() {
  const { filteredRegions } = useDashboard();
  const data = useMemo(
    () =>
      buildDistribution(
        filteredRegions,
        (region) => region.pctTidakTerkelola,
        [
          { label: "0-20%", min: 0, max: 20, color: "#FBD9BF" },
          { label: "20-40%", min: 20, max: 40, color: "#F4B685" },
          { label: "40-60%", min: 40, max: 60, color: "#EA9050" },
          { label: "60-80%", min: 60, max: 80, color: "#DE7326" },
          { label: "80-100%", min: 80, max: Infinity, color: "#D55E00" },
        ],
      ),
    [filteredRegions],
  );

  return (
    <DistributionChart
      data={data}
      xTitle="% sampah tidak terkelola di tiap wilayah"
    />
  );
}
