"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceArea,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ResponsiveContainer } from "@/components/charts/responsive";
import {
  CLUSTER_BY_ID,
  CLUSTER_META,
} from "@/lib/constants";
import {
  formatCompactNumber,
  formatCompactTon,
  formatNumber,
} from "@/lib/format";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { ChartKey } from "@/components/charts/bar-list";
import { RegionTooltip } from "@/components/charts/region-tooltip";
import {
  axisTick,
  cartesianGrid,
  tooltipContentStyle,
  tooltipItemStyle,
  tooltipLabelStyle,
} from "@/components/charts/chart-theme";
import { useExpanded } from "@/components/ui/expandable";
import { useHover } from "@/components/charts/use-hover";
import type { ClusterId, ProvinceAggregate, Region } from "@/lib/types";

const GAP_ORANGE = "#D55E00";

/** Tick sumbu pendek tanpa desimal agar tidak membungkus baris. */
function shortTon(value: number) {
  if (value >= 1_000_000) return `${Math.round(value / 100_000) / 10} jt`;
  if (value >= 1_000) return `${Math.round(value / 1_000)} rb`;
  return String(Math.round(value));
}

function percentile(values: number[], p: number) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
}

/**
 * Peta prioritas: kanan = lebih banyak terkelola, atas = lebih banyak sampah
 * tidak terkelola. Zona oranye (kiri atas) = wilayah yang paling perlu perhatian.
 */
export function GapScatter() {
  const { filteredRegions, setCluster } = useDashboard();
  const [focus, setFocus] = useState<ClusterId | null>(null);

  if (filteredRegions.length === 0) {
    return <EmptyState />;
  }

  const series = CLUSTER_META.map((meta) => ({
    ...meta,
    data: filteredRegions.filter((region) => region.cluster === meta.id),
  })).filter((item) => item.data.length > 0);

  const tons = filteredRegions.map((region) => region.tidakTerkelolaTon);
  const threshold = percentile(tons, 0.8);
  const top = Math.max(...tons) * 1.08;
  const named = [...filteredRegions]
    .filter((region) => region.pctTerkelola < 50)
    .sort((a, b) => b.tidakTerkelolaTon - a.tidakTerkelolaTon)
    .slice(0, 5);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ChartKey
        items={series.map((item) => ({ id: item.id, label: item.short, color: item.color }))}
        focus={focus}
        onFocus={setFocus}
        onPick={setCluster}
      />
      <div className="min-h-0 w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 24, left: 0, bottom: 32 }}>
            <CartesianGrid vertical={false} {...cartesianGrid} />
            <XAxis
              type="number"
              dataKey="pctTerkelola"
              name="% terkelola"
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(value) => `${value}%`}
              tick={axisTick}
              tickLine={false}
              axisLine={{ stroke: "#CBD5E1" }}
              label={{
                value: "Sampah yang terkelola (%)  \u2192 makin baik",
                position: "insideBottom",
                offset: -22,
                fill: "#64748B",
                fontSize: 12,
              }}
            />
            <YAxis
              type="number"
              dataKey="tidakTerkelolaTon"
              name="Tidak terkelola"
              domain={[0, top]}
              tickFormatter={(value) => shortTon(Number(value))}
              tick={axisTick}
              tickLine={false}
              axisLine={false}
              width={58}
              label={{
                value: "\u2191 Ton tidak terkelola / tahun",
                angle: -90,
                position: "insideLeft",
                offset: 2,
                fill: "#64748B",
                fontSize: 12,
                style: { textAnchor: "middle" },
              }}
            />
            <ReferenceArea
              x1={0}
              x2={50}
              y1={threshold}
              y2={top}
              fill={GAP_ORANGE}
              fillOpacity={0.07}
              stroke={GAP_ORANGE}
              strokeOpacity={0.35}
              strokeDasharray="4 4"
              label={{
                value: "Zona prioritas",
                position: "insideTopRight",
                fill: GAP_ORANGE,
                fontSize: 12,
                fontWeight: 700,
              }}
            />
            <Tooltip
              content={<RegionTooltip />}
              cursor={{ strokeDasharray: "4 4", stroke: "#94A3B8" }}
            />
            {series.map((item) => (
              <Scatter
                isAnimationActive={false}
                key={item.id}
                name={item.label}
                data={item.data}
                fill={item.color}
                fillOpacity={focus === null || focus === item.id ? 0.72 : 0.1}
                stroke={item.color}
                strokeOpacity={focus === null || focus === item.id ? 1 : 0.15}
                strokeWidth={0.75}
                onClick={(point) => {
                  const region = (point as { payload?: Region }).payload;
                  if (region) setCluster(region.cluster);
                }}
              />
            ))}
            <Scatter
              isAnimationActive={false}
              tooltipType="none"
              data={named}
              fill="none"
              stroke="#16181D"
              strokeWidth={1.5}
            >
              <LabelList
                dataKey="kabKota"
                position="right"
                offset={8}
                fontSize={11}
                fontWeight={600}
                fill="#16181D"
              />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

type GapMetric = "tidakTerkelolaTon" | "pctTidakTerkelola";

export function GapRanking() {
  const { rank, setSearch, filters } = useDashboard();
  const [metric, setMetric] = useState<GapMetric>("tidakTerkelolaTon");
  const expanded = useExpanded();
  const hover = useHover();
  const data = rank(metric, expanded ? 30 : 10);

  if (data.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-2 flex shrink-0 flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMetric("tidakTerkelolaTon")}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
            metric === "tidakTerkelolaTon"
              ? "bg-[#16181D] text-white"
              : "bg-[#F3F0EA] text-slate-600 hover:bg-[#E9E4DB]"
          }`}
        >
          Volume (ton)
        </button>
        <button
          type="button"
          onClick={() => setMetric("pctTidakTerkelola")}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
            metric === "pctTidakTerkelola"
              ? "bg-[#16181D] text-white"
              : "bg-[#F3F0EA] text-slate-600 hover:bg-[#E9E4DB]"
          }`}
        >
          Persentase (%)
        </button>
        <span className="ml-auto text-xs text-slate-500">
          Klik batang untuk memfilter wilayah
        </span>
      </div>
      <div
        className="min-h-0 w-full flex-1"
        style={{ minHeight: expanded ? data.length * 30 : undefined }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 58, left: 4, bottom: 4 }}
            barCategoryGap={8}
          >
            <CartesianGrid horizontal={false} {...cartesianGrid} />
            <XAxis
              type="number"
              tickFormatter={(value) =>
                metric === "pctTidakTerkelola"
                  ? `${formatNumber(Number(value), 0)}%`
                  : formatCompactNumber(Number(value))
              }
              tick={axisTick}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="kabKota"
              width={174}
              tick={axisTick}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={<RegionTooltip />}
              cursor={{ fill: "rgba(22, 24, 29, 0.05)" }}
            />
            <Bar isAnimationActive={false}
              {...hover.handlers}
              dataKey={metric}
              radius={[0, 6, 6, 0]}
              barSize={15}
              onClick={(entry) => {
                const region = (entry as { payload?: Region }).payload;
                if (region) {
                  setSearch(
                    filters.search === region.kabKota
                      ? ""
                      : region.kabKota,
                  );
                }
              }}
              className="cursor-pointer"
            >
              {data.map((region, index) => (
                <Cell
                  key={`${region.provinsi}-${region.kabKota}`}
                  fill={CLUSTER_BY_ID[region.cluster].color}
                  fillOpacity={hover.dim(index)}
                />
              ))}
              <LabelList
                dataKey={metric}
                position="right"
                fontSize={12}
                fill="#475569"
                formatter={(value) =>
                  metric === "pctTidakTerkelola"
                    ? `${formatNumber(Number(value), 0)}%`
                    : formatCompactNumber(Number(value))
                }
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ProvinceGapBar() {
  const { provinces, setProvinsi, filters } = useDashboard();
  const expanded = useExpanded();
  const hover = useHover();
  const data = [...provinces]
    .sort((a, b) => b.tidakTerkelola - a.tidakTerkelola)
    .slice(0, expanded ? provinces.length : 10);

  if (data.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      className="h-full w-full"
      style={{ minHeight: expanded ? data.length * 30 : undefined }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 58, left: 4, bottom: 4 }}
          barCategoryGap={10}
        >
          <CartesianGrid horizontal={false} {...cartesianGrid} />
          <XAxis
            type="number"
            tickFormatter={(value) => formatCompactNumber(Number(value))}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="provinsi"
            width={178}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={tooltipContentStyle}
            itemStyle={tooltipItemStyle}
            labelStyle={tooltipLabelStyle}
            formatter={(value) => [
              formatCompactTon(Number(value)),
              "Tidak terkelola",
            ]}
            cursor={{ fill: "rgba(22, 24, 29, 0.05)" }}
          />
            <Bar isAnimationActive={false}
            {...hover.handlers}
            dataKey="tidakTerkelola"
            radius={[0, 6, 6, 0]}
            barSize={16}
            onClick={(entry) => {
              const payload = (entry as { payload?: ProvinceAggregate }).payload;
              if (payload) {
                setProvinsi(
                  filters.provinsi === payload.provinsi
                    ? "all"
                    : payload.provinsi,
                );
              }
            }}
              className="cursor-pointer"
            >
              {data.map((entry, index) => (
              <Cell
                key={entry.provinsi}
                fill="#D55E00"
                fillOpacity={
                  (filters.provinsi === "all" ||
                  filters.provinsi === entry.provinsi
                    ? 1
                    : 0.55) * hover.dim(index)
                }
                />
              ))}
              <LabelList
                dataKey="tidakTerkelola"
                position="right"
                fontSize={12}
                fill="#475569"
                formatter={(value) => formatCompactNumber(Number(value))}
              />
            </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
