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
import {
  COMPOSITION_COLORS,
  COMPOSITION_LABELS,
} from "@/lib/constants";
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
import { COMPOSITION_KEYS } from "@/lib/types";

export function CompositionDonut() {
  const { compositionAvg } = useDashboard();
  const data = compositionAvg.filter((item) => item.value > 0.05);

  if (data.length === 0) {
    return <EmptyState />;
  }

  const top = [...data].sort((a, b) => b.value - a.value)[0];

  return (
    <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
      <div className="relative h-[270px]">
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
          <span className="max-w-[90px] text-center text-[10px] font-medium uppercase leading-4 tracking-wide text-slate-500">
            {top.label}
          </span>
          <span className="mt-1 text-2xl font-semibold text-slate-950">
            {formatPct(top.value)}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-1.5">
        {data.map((entry) => (
          <div
            key={entry.key}
            className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[11px] text-slate-600 odd:bg-slate-50"
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

export function CompositionStackedBar() {
  const { compositionProvinces, setProvinsi, filters } = useDashboard();

  if (compositionProvinces.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="h-[420px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={compositionProvinces}
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
            width={150}
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
              <span className="text-[10px] text-slate-600">{value}</span>
            )}
          />
          {COMPOSITION_KEYS.map((key) => (
            <Bar
              key={key}
              dataKey={`values.${key}`}
              name={COMPOSITION_LABELS[key]}
              stackId="komposisi"
              fill={COMPOSITION_COLORS[key]}
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
