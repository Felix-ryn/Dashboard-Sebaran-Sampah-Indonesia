"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import {
  CHART_COLORS,
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
import { RegionTooltip } from "@/components/charts/region-tooltip";
import {
  axisTick,
  cartesianGrid,
  legendStyle,
  tooltipContentStyle,
  tooltipItemStyle,
  tooltipLabelStyle,
} from "@/components/charts/chart-theme";
import type { ProvinceAggregate, Region } from "@/lib/types";

export function GapScatter() {
  const { filteredRegions, setCluster } = useDashboard();

  if (filteredRegions.length === 0) {
    return <EmptyState />;
  }

  const series = CLUSTER_META.map((meta) => ({
    ...meta,
    data: filteredRegions.filter((region) => region.cluster === meta.id),
  })).filter((item) => item.data.length > 0);

  return (
    <div className="h-[420px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 20, left: 4, bottom: 8 }}>
          <CartesianGrid {...cartesianGrid} />
          <XAxis
            type="number"
            dataKey="timbulanTahunan"
            name="Timbulan tahunan"
            scale="sqrt"
            tickFormatter={(value) => formatCompactNumber(Number(value))}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="number"
            dataKey="pctTerkelola"
            name="% terkelola"
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            width={46}
          />
          <ZAxis
            type="number"
            dataKey="penduduk"
            range={[36, 300]}
            name="Penduduk"
          />
          <ReferenceLine
            y={50}
            stroke="#94A3B8"
            strokeDasharray="4 4"
            label={{
              value: "50% terkelola",
              position: "insideTopRight",
              fill: "#64748B",
              fontSize: 10,
            }}
          />
          <Tooltip
            content={<RegionTooltip />}
            cursor={{ strokeDasharray: "4 4", stroke: "#94A3B8" }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={legendStyle}
            formatter={(value) => (
              <span className="text-xs text-slate-600">{value}</span>
            )}
          />
          {series.map((item) => (
            <Scatter
              key={item.id}
              name={item.label}
              data={item.data}
              fill={item.color}
              fillOpacity={0.62}
              stroke={item.color}
              strokeWidth={0.5}
              onClick={(point) => {
                const region = (point as { payload?: Region }).payload;
                if (region) setCluster(region.cluster);
              }}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

type GapMetric = "tidakTerkelolaTon" | "pctTidakTerkelola";

export function GapRanking() {
  const { rank, setSearch, filters } = useDashboard();
  const [metric, setMetric] = useState<GapMetric>("tidakTerkelolaTon");
  const data = rank(metric, 10);

  if (data.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMetric("tidakTerkelolaTon")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            metric === "tidakTerkelolaTon"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Volume (ton)
        </button>
        <button
          type="button"
          onClick={() => setMetric("pctTidakTerkelola")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            metric === "pctTidakTerkelola"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Persentase (%)
        </button>
        <span className="ml-auto text-[11px] text-slate-500">
          Klik batang untuk memfilter wilayah
        </span>
      </div>
      <div className="h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 28, left: 4, bottom: 4 }}
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
              width={150}
              tick={axisTick}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={<RegionTooltip />}
              cursor={{ fill: "rgba(37, 99, 235, 0.06)" }}
            />
            <Bar
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
              {data.map((region) => (
                <Cell
                  key={`${region.provinsi}-${region.kabKota}`}
                  fill={CLUSTER_BY_ID[region.cluster].color}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ProvinceGapBar() {
  const { provinces, setProvinsi, filters } = useDashboard();
  const data = [...provinces]
    .sort((a, b) => b.tidakTerkelola - a.tidakTerkelola)
    .slice(0, 10);

  if (data.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 30, left: 4, bottom: 4 }}
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
            width={156}
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
            cursor={{ fill: "rgba(37, 99, 235, 0.06)" }}
          />
          <Bar
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
            {data.map((entry) => (
              <Cell
                key={entry.provinsi}
                fill={
                  filters.provinsi === entry.provinsi
                    ? CHART_COLORS.indigo
                    : CHART_COLORS.navy
                }
                fillOpacity={
                  filters.provinsi === "all" ||
                  filters.provinsi === entry.provinsi
                    ? 1
                    : 0.55
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
