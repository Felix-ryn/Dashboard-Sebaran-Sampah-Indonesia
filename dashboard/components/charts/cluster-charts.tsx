"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ResponsiveContainer } from "@/components/charts/responsive";
import {
  CHART_COLORS,
  CLUSTER_BY_ID,
  CLUSTER_META,
} from "@/lib/constants";
import {
  formatDecimal,
  formatNumber,
  formatPct,
} from "@/lib/format";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { BarList, ChartKey } from "@/components/charts/bar-list";
import { HeatTable } from "@/components/charts/heat-table";
import { RegionTooltip } from "@/components/charts/region-tooltip";
import {
  axisTick,
  cartesianGrid,
} from "@/components/charts/chart-theme";
import type { ClusterId, Region } from "@/lib/types";

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

interface Center {
  id: ClusterId;
  label: string;
  color: string;
  pctPenanganan: number;
  perKapita: number;
  /** Label di bawah lingkaran agar tidak menabrak klaster tetangga */
  below?: boolean;
}

function CenterMark(props: unknown) {
  const { cx, cy, payload } = props as {
    cx: number;
    cy: number;
    payload: Center;
  };
  const right = payload.pctPenanganan <= 70;
  const below = payload.below === true;
  return (
    <g pointerEvents="none">
      <circle cx={cx} cy={cy} r={9} fill="#FFFFFF" stroke={payload.color} strokeWidth={3.5} />
      <text
        x={below ? cx - 6 : cx + (right ? 15 : -15)}
        y={below ? cy + 28 : cy + 4}
        textAnchor={below || right ? "start" : "end"}
        fontSize={12}
        fontWeight={700}
        fill="#16181D"
        stroke="#FFFFFF"
        strokeWidth={4}
        paintOrder="stroke"
      >
        {payload.label}
      </text>
    </g>
  );
}

/**
 * Setiap titik = satu kabupaten/kota. Lingkaran putih bernama = titik tengah
 * (median) tiap klaster, jadi pembaca cukup melihat empat lokasi untuk
 * memahami empat segmen. Arah baca ditulis di sumbu.
 */
export function ClusterScatter() {
  const { filteredRegions, setCluster } = useDashboard();
  const [focus, setFocus] = useState<ClusterId | null>(null);

  if (filteredRegions.length === 0) {
    return <EmptyState />;
  }

  const series = CLUSTER_META.map((meta) => ({
    ...meta,
    data: filteredRegions.filter((region) => region.cluster === meta.id),
  })).filter((item) => item.data.length > 0);

  const centers: Center[] = series
    .map((item) => ({
      id: item.id,
      label: item.short,
      color: item.color,
      pctPenanganan: median(item.data.map((region) => region.pctPenanganan)),
      perKapita: median(item.data.map((region) => region.perKapita)),
    }))
    .sort((a, b) => a.pctPenanganan - b.pctPenanganan)
    .map((center, index) => ({ ...center, below: index === 0 }));

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
              dataKey="pctPenanganan"
              name="% ditangani"
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={axisTick}
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.muted }}
              tickFormatter={(value) => `${value}%`}
              label={{
                value: "Sampah yang ditangani (%)  \u2192 makin banyak",
                position: "insideBottom",
                offset: -22,
                fill: "#64748B",
                fontSize: 12,
              }}
            />
            <YAxis
              type="number"
              dataKey="perKapita"
              name="Per kapita"
              tick={axisTick}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(value) => formatDecimal(Number(value), 1)}
              label={{
                value: "\u2191 Sampah per orang (kg/hari)",
                angle: -90,
                position: "insideLeft",
                offset: 2,
                fill: "#64748B",
                fontSize: 12,
                style: { textAnchor: "middle" },
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
                fillOpacity={focus === null || focus === item.id ? 0.7 : 0.1}
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
              data={centers}
              shape={CenterMark}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const MANAGEMENT_COLORS = {
  pengurangan: "#004B73",
  penanganan: "#56A5D4",
  tidak: CHART_COLORS.muted,
};

export function ClusterProfileBar() {
  const { filteredRegions, setCluster, filters } = useDashboard();

  const rows = CLUSTER_META.map((meta) => {
    const group = filteredRegions.filter((region) => region.cluster === meta.id);
    const sum = (pick: (region: Region) => number) =>
      group.reduce((total, region) => total + pick(region), 0);
    const pengurangan = sum((region) => region.penguranganTon);
    const penanganan = sum((region) => region.penangananTon);
    const tidak = sum((region) => region.tidakTerkelolaTon);
    const total = pengurangan + penanganan + tidak;
    const pct = (value: number) => (total > 0 ? (value / total) * 100 : 0);
    return {
      meta,
      count: group.length,
      pengurangan: pct(pengurangan),
      penanganan: pct(penanganan),
      tidak: pct(tidak),
    };
  }).filter((row) => row.count > 0);

  if (rows.length === 0) {
    return <EmptyState />;
  }

  const segments = [
    { key: "pengurangan", label: "Pengurangan", dark: true },
    { key: "penanganan", label: "Penanganan", dark: false },
    { key: "tidak", label: "Tidak terkelola", dark: false },
  ] as const;

  return (
    <div className="max-h-full overflow-y-auto">
      <ChartKey
        items={segments.map((segment) => ({
          label: segment.label,
          color: MANAGEMENT_COLORS[segment.key],
        }))}
      />
      <ul className="space-y-2">
        {rows.map((row) => {
          const dimmed =
            filters.cluster !== "all" && filters.cluster !== row.meta.id;
          return (
            <li
              key={row.meta.id}
              className={dimmed ? "opacity-45 transition-opacity" : "transition-opacity"}
            >
              <button
                type="button"
                onClick={() =>
                  setCluster(filters.cluster === row.meta.id ? "all" : row.meta.id)
                }
                className="flex w-full items-center gap-3 rounded-md px-1 py-1 text-left hover:bg-slate-50"
              >
                <span className="flex w-36 shrink-0 items-center gap-2 text-sm text-slate-700 sm:w-44">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: row.meta.color }}
                  />
                  {row.meta.short}
                </span>
                <span className="flex h-8 min-w-0 flex-1 overflow-hidden rounded-sm">
                  {segments.map((segment) => {
                    const value = row[segment.key];
                    return (
                      <span
                        key={segment.key}
                        className="flex items-center justify-center text-xs font-semibold"
                        style={{
                          width: `${value}%`,
                          backgroundColor: MANAGEMENT_COLORS[segment.key],
                          color: segment.dark ? "#FFFFFF" : "#0F172A",
                        }}
                      >
                        {value >= 9 ? formatPct(value, 0) : ""}
                      </span>
                    );
                  })}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ClusterPerKapitaBar() {
  const { profiles, setCluster, filters, national } = useDashboard();
  const items = profiles
    .filter((profile) => profile.jumlahWilayah > 0)
    .sort((a, b) => b.medianPerKapita - a.medianPerKapita)
    .map((profile) => ({
      key: profile.cluster,
      label: CLUSTER_BY_ID[profile.cluster].short,
      value: profile.medianPerKapita,
      valueLabel: `${formatDecimal(profile.medianPerKapita, 2)} kg`,
      color: CLUSTER_BY_ID[profile.cluster].color,
    }));

  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="max-h-full overflow-y-auto">
      <BarList
        ariaLabel="Median timbulan per kapita per klaster"
        items={items}
        activeKey={filters.cluster}
        onSelect={(key) =>
          setCluster(filters.cluster === key ? "all" : (key as ClusterId))
        }
      />
      <p className="mt-4 text-xs text-slate-500">
        Rata-rata seluruh wilayah terfilter:{" "}
        <span className="font-semibold text-slate-700">
          {formatDecimal(national.perKapita, 2)} kg/orang/hari
        </span>
      </p>
    </div>
  );
}

export function ClusterCountBars() {
  const { clusterSummary, setCluster, filters } = useDashboard();
  const total = clusterSummary.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) {
    return <EmptyState />;
  }

  const items = [...clusterSummary]
    .sort((a, b) => b.count - a.count)
    .map((entry) => ({
      key: entry.cluster,
      label: CLUSTER_BY_ID[entry.cluster].short,
      value: entry.count,
      valueLabel: `${formatNumber(entry.count)} \u00B7 ${formatPct((entry.count / total) * 100, 0)}`,
      color: entry.color,
    }));

  return (
    <BarList
      ariaLabel="Jumlah wilayah per klaster"
      items={items}
      activeKey={filters.cluster}
      onSelect={(key) =>
        setCluster(filters.cluster === key ? "all" : (key as ClusterId))
      }
    />
  );
}

export function ClusterProfileTable() {
  const { profiles, setCluster, filters } = useDashboard();
  const active = profiles.filter((profile) => profile.jumlahWilayah > 0);

  if (active.length === 0) {
    return <EmptyState />;
  }

  return (
    <HeatTable
      rowHeader="Klaster"
      activeKey={filters.cluster}
      onSelect={(key) =>
        setCluster(filters.cluster === key ? "all" : (key as ClusterId))
      }
      columns={[
        { key: "tangani", label: "Ditangani", format: (v) => formatPct(v, 0) },
        { key: "kurang", label: "Dikurangi", format: (v) => formatPct(v, 1) },
        { key: "tidak", label: "Tidak terkelola", format: (v) => formatPct(v, 0) },
        { key: "kapita", label: "Kg per orang/hari", format: (v) => formatDecimal(v, 2) },
      ]}
      rows={active.map((profile) => ({
        key: profile.cluster,
        label: CLUSTER_BY_ID[profile.cluster].short,
        swatch: CLUSTER_BY_ID[profile.cluster].color,
        values: [
          profile.medianPenanganan,
          profile.medianPengurangan,
          profile.medianTidakTerkelola,
          profile.medianPerKapita,
        ],
      }))}
    />
  );
}

