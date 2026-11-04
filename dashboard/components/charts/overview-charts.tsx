"use client";

import type { TooltipContentProps } from "recharts";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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
  formatPerKapita,
} from "@/lib/format";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { EmptyState } from "@/components/ui/empty-state";
import {
  axisTick,
  cartesianGrid,
  legendStyle,
  tooltipContentStyle,
  tooltipItemStyle,
} from "@/components/charts/chart-theme";
import type { ProvinceAggregate } from "@/lib/types";

function ProvinceTooltip({
  active,
  payload,
}: Partial<TooltipContentProps>) {
  if (!active || !payload?.length) return null;
  const province = payload[0]?.payload as ProvinceAggregate | undefined;
  if (!province) return null;

  return (
    <div className="min-w-[250px] rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-xl">
      <p className="text-base font-semibold text-slate-950">
        {province.provinsi}
      </p>
      <p className="mt-0.5 text-slate-500">
        {formatNumber(province.nWilayah)} kabupaten/kota
      </p>
      <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between gap-5">
          <span className="text-slate-500">Total timbulan</span>
          <span className="font-semibold text-slate-900">
            {formatCompactTon(province.timbulan)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-5">
          <span className="flex items-center gap-2 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            Terkelola
          </span>
          <span className="font-semibold text-slate-900">
            {formatCompactTon(province.terkelola)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-5">
          <span className="flex items-center gap-2 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            Tidak terkelola
          </span>
          <span className="font-semibold text-slate-900">
            {formatCompactTon(province.tidakTerkelola)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-5">
          <span className="text-slate-500">Rasio terkelola</span>
          <span className="font-semibold text-blue-700">
            {formatPct(province.pctTerkelola)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-5">
          <span className="text-slate-500">Per kapita</span>
          <span className="font-semibold text-slate-900">
            {formatPerKapita(province.perKapita)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ProvinceTimbulanBar() {
  const { provinces, setProvinsi, filters } = useDashboard();
  const data = provinces.slice(0, 10);

  if (data.length === 0) {
    return <EmptyState />;
  }

  const opacity = (provinsi: string) =>
    filters.provinsi === "all" || filters.provinsi === provinsi ? 1 : 0.45;

  const handleClick = (entry: unknown) => {
    const payload = (entry as { payload?: ProvinceAggregate }).payload;
    if (payload) {
      setProvinsi(
        filters.provinsi === payload.provinsi ? "all" : payload.provinsi,
      );
    }
  };

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 28, left: 4, bottom: 4 }}
          barCategoryGap={12}
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
            width={188}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={<ProvinceTooltip />}
            cursor={{ fill: "rgba(37, 99, 235, 0.06)" }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={legendStyle}
            formatter={(value) => (
              <span className="text-xs text-slate-600">{value}</span>
            )}
          />
          <Bar
            dataKey="terkelola"
            name="Terkelola"
            stackId="timbulan"
            barSize={20}
            onClick={handleClick}
            className="cursor-pointer"
          >
            {data.map((entry) => (
              <Cell
                key={`terkelola-${entry.provinsi}`}
                fill={CHART_COLORS.primary}
                fillOpacity={opacity(entry.provinsi)}
              />
            ))}
          </Bar>
          <Bar
            dataKey="tidakTerkelola"
            name="Tidak terkelola"
            stackId="timbulan"
            barSize={20}
            radius={[0, 6, 6, 0]}
            onClick={handleClick}
            className="cursor-pointer"
          >
            {data.map((entry) => (
              <Cell
                key={`tidak-${entry.provinsi}`}
                fill="#CBD5E1"
                fillOpacity={opacity(entry.provinsi)}
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
    <div className="grid items-center gap-5 sm:grid-cols-[minmax(0,1fr)_210px]">
      <div className="relative h-[300px]">
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
                formatCompactTon(Number(value)),
                String(name),
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Terkelola
          </span>
          <span className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
            {formatPct(national.pctTerkelola)}
          </span>
          <span className="mt-1 text-sm text-slate-500">
            {formatCompactTon(national.terkelola)}
          </span>
        </div>
      </div>
      <div className="space-y-3">
        {data.map((entry) => (
          <div
            key={entry.name}
            className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </div>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {formatCompactTon(entry.value)}
            </p>
            <p className="mt-0.5 text-sm text-slate-500">
              {formatNumber((entry.value / national.timbulan) * 100, 1)}% dari
              timbulan
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
