"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS } from "@/lib/constants";
import {
  formatCompactNumber,
  formatCompactTon,
  formatNumber,
  formatPct,
  formatTon,
} from "@/lib/format";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { EmptyState } from "@/components/ui/empty-state";
import {
  axisTick,
  cartesianGrid,
  tooltipContentStyle,
  tooltipItemStyle,
  tooltipLabelStyle,
} from "@/components/charts/chart-theme";
import type { ProvinceAggregate } from "@/lib/types";

export function ProvinceTimbulanBar() {
  const { provinces, setProvinsi, filters } = useDashboard();
  const data = provinces.slice(0, 10);

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
              "Timbulan tahunan",
            ]}
            cursor={{ fill: "rgba(37, 99, 235, 0.06)" }}
          />
          <Bar
            dataKey="timbulan"
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
                    : CHART_COLORS.primary
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

export function ManagementDonut() {
  const { national } = useDashboard();

  if (national.timbulan <= 0) {
    return <EmptyState />;
  }

  const data = [
    {
      name: "Terkelola",
      value: national.terkelola,
      color: CHART_COLORS.primary,
    },
    {
      name: "Tidak terkelola",
      value: national.tidakTerkelola,
      color: "#CBD5E1",
    },
  ];

  return (
    <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_190px]">
      <div className="relative h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="84%"
              paddingAngle={2}
              stroke="#FFFFFF"
              strokeWidth={2}
              animationDuration={700}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipContentStyle}
              itemStyle={tooltipItemStyle}
              formatter={(value, name) => [
                formatTon(Number(value), 0),
                String(name),
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
            Terkelola
          </span>
          <span className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
            {formatPct(national.pctTerkelola)}
          </span>
          <span className="mt-1 text-[11px] text-slate-500">
            {formatCompactTon(national.terkelola)}
          </span>
        </div>
      </div>
      <div className="space-y-3">
        {data.map((entry) => (
          <div
            key={entry.name}
            className="rounded-xl border border-slate-100 bg-slate-50/60 p-3"
          >
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </div>
            <p className="mt-1.5 text-sm font-semibold text-slate-900">
              {formatCompactTon(entry.value)}
            </p>
            <p className="text-[11px] text-slate-500">
              {formatNumber((entry.value / national.timbulan) * 100, 1)}% dari
              timbulan
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
