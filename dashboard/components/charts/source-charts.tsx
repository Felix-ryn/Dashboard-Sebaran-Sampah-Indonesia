"use client";

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
import { SOURCE_COLORS, SOURCE_LABELS } from "@/lib/constants";
import { formatPct } from "@/lib/format";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { EmptyState } from "@/components/ui/empty-state";
import {
  axisTick,
  cartesianGrid,
  legendStyle,
  tooltipContentStyle,
  tooltipItemStyle,
  tooltipLabelStyle,
} from "@/components/charts/chart-theme";
import { SOURCE_KEYS } from "@/lib/types";

export function SourceDonut() {
  const { sourceAvg } = useDashboard();
  const data = sourceAvg.filter((item) => item.value > 0.05);

  if (data.length === 0) {
    return <EmptyState />;
  }

  const top = [...data].sort((a, b) => b.value - a.value)[0];

  return (
    <div className="grid items-center gap-5 sm:grid-cols-[minmax(0,1fr)_230px]">
      <div className="relative h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="58%"
              outerRadius="84%"
              paddingAngle={1.5}
              stroke="#FFFFFF"
              strokeWidth={1.5}
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipContentStyle}
              itemStyle={tooltipItemStyle}
              formatter={(value, name) => [
                formatPct(Number(value)),
                String(name),
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="max-w-[110px] text-center text-xs font-semibold uppercase leading-5 tracking-wide text-slate-500">
            {top.label}
          </span>
          <span className="mt-1 text-3xl font-semibold text-slate-950">
            {formatPct(top.value)}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
        {data.map((entry) => (
          <div
            key={entry.key}
            className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-600 odd:bg-slate-50"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="truncate">{entry.label}</span>
            </span>
            <span className="font-semibold text-slate-900">
              {formatPct(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SourceStackedBar() {
  const { sourceProvinces, setProvinsi, filters } = useDashboard();

  if (sourceProvinces.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="h-[460px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sourceProvinces}
          layout="vertical"
          margin={{ top: 4, right: 18, left: 4, bottom: 4 }}
          barCategoryGap={10}
        >
          <CartesianGrid horizontal={false} {...cartesianGrid} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
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
            formatter={(value, name) => [
              formatPct(Number(value)),
              String(name),
            ]}
            cursor={{ fill: "rgba(37, 99, 235, 0.06)" }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={legendStyle}
            formatter={(value) => (
              <span className="text-xs text-slate-600">{value}</span>
            )}
          />
          {SOURCE_KEYS.map((key) => (
            <Bar
              key={key}
              dataKey={`values.${key}`}
              name={SOURCE_LABELS[key]}
              stackId="sumber"
              fill={SOURCE_COLORS[key]}
              onClick={(entry) => {
                const payload = (
                  entry as { payload?: { provinsi?: string } }
                ).payload;
                if (payload?.provinsi) {
                  setProvinsi(
                    filters.provinsi === payload.provinsi
                      ? "all"
                      : payload.provinsi,
                  );
                }
              }}
              className="cursor-pointer"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
