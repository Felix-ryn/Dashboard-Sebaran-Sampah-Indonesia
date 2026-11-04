"use client";

import type { TooltipContentProps } from "recharts";
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
import { axisTick, cartesianGrid } from "@/components/charts/chart-theme";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNumber, formatPct } from "@/lib/format";

interface DominantItem {
  key: string;
  label: string;
  count: number;
  color: string;
}

function DominantTooltip({
  active,
  payload,
}: Partial<TooltipContentProps>) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload as
    | (DominantItem & { share: number })
    | undefined;
  if (!item) return null;

  return (
    <div className="min-w-[210px] rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-xl">
      <p className="font-semibold text-slate-950">{item.label}</p>
      <div className="mt-2 space-y-1.5 border-t border-slate-100 pt-2.5">
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Jumlah wilayah</span>
          <span className="font-semibold text-slate-900">
            {formatNumber(item.count)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Proporsi</span>
          <span className="font-semibold text-blue-700">
            {formatPct(item.share)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function DominantBar({
  items,
  total,
  height = 330,
}: {
  items: DominantItem[];
  total: number;
  height?: number;
}) {
  const data = items
    .filter((item) => item.count > 0)
    .slice(0, 7)
    .map((item) => ({
      ...item,
      share: total > 0 ? (item.count / total) * 100 : 0,
    }));

  if (data.length === 0) return <EmptyState />;

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 44, left: 4, bottom: 4 }}
          barCategoryGap={9}
        >
          <CartesianGrid horizontal={false} {...cartesianGrid} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={150}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<DominantTooltip />} />
          <Bar dataKey="count" radius={[0, 7, 7, 0]} barSize={22}>
            {data.map((item) => (
              <Cell key={item.key} fill={item.color} />
            ))}
            <LabelList
              dataKey="count"
              position="right"
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
