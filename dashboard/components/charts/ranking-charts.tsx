"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CLUSTER_BY_ID } from "@/lib/constants";
import { formatCompactNumber, formatDecimal } from "@/lib/format";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { RegionTooltip } from "@/components/charts/region-tooltip";
import {
  axisTick,
  cartesianGrid,
} from "@/components/charts/chart-theme";
import type { Region } from "@/lib/types";

function RegionRankingBar({
  data,
  metric,
  average,
}: {
  data: Region[];
  metric: "timbulanTahunan" | "perKapita";
  average?: number;
}) {
  const { setSearch, filters } = useDashboard();

  if (data.length === 0) return <EmptyState />;

  return (
    <div className="h-[390px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 58, left: 4, bottom: 4 }}
          barCategoryGap={9}
        >
          <CartesianGrid horizontal={false} {...cartesianGrid} />
          <XAxis
            type="number"
            tickFormatter={(value) =>
              metric === "perKapita"
                ? formatDecimal(Number(value), 1)
                : formatCompactNumber(Number(value))
            }
            tick={axisTick}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="kabKota"
            width={170}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
          />
          {average !== undefined ? (
            <ReferenceLine
              x={average}
              stroke="#64748B"
              strokeDasharray="5 4"
              label={{
                value: "Rata-rata",
                position: "insideTopRight",
                fill: "#64748B",
                fontSize: 12,
              }}
            />
          ) : null}
          <Tooltip content={<RegionTooltip />} />
          <Bar
            dataKey={metric}
            radius={[0, 7, 7, 0]}
            barSize={20}
            onClick={(entry) => {
              const region = (entry as { payload?: Region }).payload;
              if (region) {
                setSearch(
                  filters.search === region.kabKota ? "" : region.kabKota,
                );
              }
            }}
            className="cursor-pointer"
          >
            {data.map((region) => (
              <Cell
                key={`${region.provinsi}-${region.kabKota}`}
                fill={CLUSTER_BY_ID[region.cluster].color}
              />
            ))}
            <LabelList
              dataKey={metric}
              position="right"
              fontSize={12}
              fill="#475569"
              formatter={(value) =>
                metric === "perKapita"
                  ? formatDecimal(Number(value), 2)
                  : formatCompactNumber(Number(value))
              }
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopTimbulanRegionsBar() {
  const { filteredRegions } = useDashboard();
  const data = [...filteredRegions]
    .sort((a, b) => b.timbulanTahunan - a.timbulanTahunan)
    .slice(0, 10);

  return <RegionRankingBar data={data} metric="timbulanTahunan" />;
}

export function TopPerKapitaRegionsBar() {
  const { filteredRegions, national } = useDashboard();
  const data = [...filteredRegions]
    .sort((a, b) => b.perKapita - a.perKapita)
    .slice(0, 10);

  return (
    <RegionRankingBar
      data={data}
      metric="perKapita"
      average={national.perKapita}
    />
  );
}
