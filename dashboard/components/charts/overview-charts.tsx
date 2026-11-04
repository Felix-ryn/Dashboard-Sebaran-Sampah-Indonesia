"use client";

import type { TooltipContentProps } from "recharts";
import { ResponsiveContainer } from "@/components/charts/responsive";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import { ChartKey } from "@/components/charts/bar-list";
import {
  axisTick,
  cartesianGrid,
} from "@/components/charts/chart-theme";
import { useExpanded } from "@/components/ui/expandable";
import { useHover } from "@/components/charts/use-hover";
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
  const expanded = useExpanded();
  const data = provinces.slice(0, expanded ? provinces.length : 10);
  const hover = useHover();

  if (data.length === 0) {
    return <EmptyState />;
  }

  const opacity = (provinsi: string, index: number) =>
    (filters.provinsi === "all" || filters.provinsi === provinsi ? 1 : 0.45) *
    hover.dim(index);

  const handleClick = (entry: unknown) => {
    const payload = (entry as { payload?: ProvinceAggregate }).payload;
    if (payload) {
      setProvinsi(
        filters.provinsi === payload.provinsi ? "all" : payload.provinsi,
      );
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ChartKey
        items={[
          { label: "Terkelola", color: CHART_COLORS.primary },
          { label: "Tidak terkelola", color: CHART_COLORS.muted },
        ]}
      />
      <div
        className="min-h-0 w-full flex-1"
        style={{ minHeight: expanded ? data.length * 30 : undefined }}
      >
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
            cursor={{ fill: "rgba(22, 24, 29, 0.05)" }}
          />
          <Bar isAnimationActive={false}
            {...hover.handlers}
            dataKey="terkelola"
            name="Terkelola"
            stackId="timbulan"
            barSize={20}
            onClick={handleClick}
            className="cursor-pointer"
          >
            {data.map((entry, index) => (
              <Cell
                key={`terkelola-${entry.provinsi}`}
                fill={CHART_COLORS.primary}
                fillOpacity={opacity(entry.provinsi, index)}
              />
            ))}
          </Bar>
          <Bar isAnimationActive={false}
            {...hover.handlers}
            dataKey="tidakTerkelola"
            name="Tidak terkelola"
            stackId="timbulan"
            barSize={20}
            radius={[0, 6, 6, 0]}
            onClick={handleClick}
            className="cursor-pointer"
          >
            {data.map((entry, index) => (
              <Cell
                key={`tidak-${entry.provinsi}`}
                fill={CHART_COLORS.muted}
                fillOpacity={opacity(entry.provinsi, index)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ManagementShare() {
  const { national } = useDashboard();

  if (national.timbulan <= 0) {
    return <EmptyState />;
  }

  const terkelola = national.pctTerkelola;
  const tidak = national.pctTidakTerkelola;

  return (
    <div className="flex h-full flex-col justify-center">
      <p className="text-4xl font-semibold tracking-tight text-slate-950">
        {formatPct(terkelola)}
        <span className="mt-1 block text-sm font-medium text-slate-500">
          timbulan tercatat terkelola
        </span>
      </p>
      <div
        className="mt-6 flex h-8 w-full overflow-hidden rounded-sm"
        role="img"
        aria-label={`Terkelola ${formatPct(terkelola)}, tidak terkelola ${formatPct(tidak)}`}
      >
        <div
          style={{
            width: `${terkelola}%`,
            backgroundColor: CHART_COLORS.primary,
          }}
        />
        <div
          style={{ width: `${tidak}%`, backgroundColor: CHART_COLORS.muted }}
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-semibold" style={{ color: CHART_COLORS.primary }}>
            Terkelola
          </p>
          <p className="text-lg font-semibold text-slate-900">
            {formatCompactTon(national.terkelola)}
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-500">Tidak terkelola</p>
          <p className="text-lg font-semibold text-slate-900">
            {formatCompactTon(national.tidakTerkelola)}
          </p>
        </div>
      </div>
    </div>
  );
}

