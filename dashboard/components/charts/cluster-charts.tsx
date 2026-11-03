"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
import { RegionTooltip } from "@/components/charts/region-tooltip";
import {
  axisTick,
  cartesianGrid,
  legendStyle,
  tooltipContentStyle,
  tooltipItemStyle,
  tooltipLabelStyle,
} from "@/components/charts/chart-theme";
import type { ClusterId, Region } from "@/lib/types";

export function PcaScatter() {
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
            dataKey="pca1"
            name="PCA 1"
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatDecimal(Number(value), 1)}
          />
          <YAxis
            type="number"
            dataKey="pca2"
            name="PCA 2"
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            width={46}
            tickFormatter={(value) => formatDecimal(Number(value), 1)}
          />
          <ReferenceLine x={0} stroke="#CBD5E1" strokeDasharray="4 4" />
          <ReferenceLine y={0} stroke="#CBD5E1" strokeDasharray="4 4" />
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
              fillOpacity={0.66}
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

export function ClusterProfileBar() {
  const { profiles, setCluster, filters } = useDashboard();
  const data = profiles
    .filter((profile) => profile.jumlahWilayah > 0)
    .map((profile) => ({
      ...profile,
      name: CLUSTER_BY_ID[profile.cluster].short,
      color: CLUSTER_BY_ID[profile.cluster].color,
    }));

  if (data.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
          barCategoryGap={22}
        >
          <CartesianGrid vertical={false} {...cartesianGrid} />
          <XAxis
            dataKey="name"
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            width={42}
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
          <Bar
            dataKey="medianPengurangan"
            name="Median pengurangan"
            fill={CHART_COLORS.teal}
            radius={[5, 5, 0, 0]}
            barSize={18}
            onClick={(entry) => {
              const payload = (
                entry as { payload?: { cluster?: ClusterId } }
              ).payload;
              if (payload?.cluster !== undefined) {
                setCluster(
                  filters.cluster === payload.cluster
                    ? "all"
                    : payload.cluster,
                );
              }
            }}
            className="cursor-pointer"
          />
          <Bar
            dataKey="medianPenanganan"
            name="Median penanganan"
            fill={CHART_COLORS.primary}
            radius={[5, 5, 0, 0]}
            barSize={18}
            onClick={(entry) => {
              const payload = (
                entry as { payload?: { cluster?: ClusterId } }
              ).payload;
              if (payload?.cluster !== undefined) {
                setCluster(
                  filters.cluster === payload.cluster
                    ? "all"
                    : payload.cluster,
                );
              }
            }}
            className="cursor-pointer"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ClusterPerKapitaBar() {
  const { profiles, setCluster, filters } = useDashboard();
  const data = profiles
    .filter((profile) => profile.jumlahWilayah > 0)
    .map((profile) => ({
      ...profile,
      name: CLUSTER_BY_ID[profile.cluster].short,
      color: CLUSTER_BY_ID[profile.cluster].color,
    }));

  if (data.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
          barCategoryGap={12}
        >
          <CartesianGrid horizontal={false} {...cartesianGrid} />
          <XAxis
            type="number"
            tickFormatter={(value) => formatDecimal(Number(value), 2)}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={128}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={tooltipContentStyle}
            itemStyle={tooltipItemStyle}
            labelStyle={tooltipLabelStyle}
            formatter={(value) => [
              `${formatDecimal(Number(value), 2)} kg/orang/hari`,
              "Median per kapita",
            ]}
            cursor={{ fill: "rgba(37, 99, 235, 0.06)" }}
          />
          <Bar
            dataKey="medianPerKapita"
            radius={[0, 6, 6, 0]}
            barSize={16}
            onClick={(entry) => {
              const payload = (
                entry as { payload?: { cluster?: ClusterId } }
              ).payload;
              if (payload?.cluster !== undefined) {
                setCluster(
                  filters.cluster === payload.cluster
                    ? "all"
                    : payload.cluster,
                );
              }
            }}
            className="cursor-pointer"
          >
            {data.map((profile) => (
              <Cell
                key={profile.cluster}
                fill={profile.color}
                fillOpacity={
                  filters.cluster === "all" ||
                  filters.cluster === profile.cluster
                    ? 1
                    : 0.45
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ClusterDonut() {
  const { clusterSummary, setCluster, filters } = useDashboard();
  const total = clusterSummary.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_200px]">
      <div className="relative h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={clusterSummary}
              dataKey="count"
              nameKey="label"
              innerRadius="60%"
              outerRadius="84%"
              paddingAngle={2}
              stroke="#FFFFFF"
              strokeWidth={2}
              onClick={(entry) => {
                const payload = (
                  entry as { payload?: { cluster?: ClusterId } }
                ).payload;
                if (payload?.cluster !== undefined) {
                  setCluster(
                    filters.cluster === payload.cluster
                      ? "all"
                      : payload.cluster,
                  );
                }
              }}
              className="cursor-pointer"
            >
              {clusterSummary.map((entry) => (
                <Cell key={entry.cluster} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipContentStyle}
              itemStyle={tooltipItemStyle}
              formatter={(value, name) => [
                `${formatNumber(Number(value))} wilayah`,
                String(name),
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-slate-950">
            {formatNumber(total)}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-slate-500">
            Wilayah
          </span>
        </div>
      </div>
      <div className="space-y-2">
        {clusterSummary.map((entry) => (
          <button
            key={entry.cluster}
            type="button"
            disabled={entry.count === 0}
            onClick={() =>
              setCluster(
                filters.cluster === entry.cluster ? "all" : entry.cluster,
              )
            }
            className={`flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
              filters.cluster === entry.cluster
                ? "border-blue-200 bg-blue-50"
                : "border-slate-100 bg-slate-50/60 hover:bg-slate-100"
            }`}
          >
            <span className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {CLUSTER_BY_ID[entry.cluster].short}
            </span>
            <span className="text-xs font-semibold text-slate-900">
              {formatNumber(entry.count)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ClusterRadar() {
  const { profiles } = useDashboard();
  const activeProfiles = profiles.filter(
    (profile) => profile.jumlahWilayah > 0,
  );

  if (activeProfiles.length === 0) {
    return <EmptyState />;
  }

  const metrics = [
    {
      key: "medianPengurangan" as const,
      label: "Pengurangan",
    },
    {
      key: "medianPenanganan" as const,
      label: "Penanganan",
    },
    {
      key: "medianPerKapita" as const,
      label: "Per kapita",
    },
  ];

  const maxima = Object.fromEntries(
    metrics.map((metric) => [
      metric.key,
      Math.max(...activeProfiles.map((profile) => profile[metric.key]), 1),
    ]),
  ) as Record<(typeof metrics)[number]["key"], number>;

  const radarData = metrics.map((metric) => {
    const row: Record<string, string | number> = { metric: metric.label };
    for (const profile of activeProfiles) {
      row[`c${profile.cluster}`] =
        (profile[metric.key] / maxima[metric.key]) * 100;
    }
    return row;
  });

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={radarData} outerRadius="70%">
          <PolarGrid stroke="#E2E8F0" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: "#64748B", fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          {activeProfiles.map((profile) => {
            const meta = CLUSTER_BY_ID[profile.cluster];
            return (
              <Radar
                key={profile.cluster}
                name={meta.label}
                dataKey={`c${profile.cluster}`}
                stroke={meta.color}
                fill={meta.color}
                fillOpacity={0.1}
                strokeWidth={2}
              />
            );
          })}
          <Tooltip
            contentStyle={tooltipContentStyle}
            itemStyle={tooltipItemStyle}
            labelStyle={tooltipLabelStyle}
            formatter={(value, name) => [
              `${formatNumber(Number(value), 0)} / 100`,
              String(name),
            ]}
          />
          <Legend
            iconType="circle"
            wrapperStyle={legendStyle}
            formatter={(value) => (
              <span className="text-[11px] text-slate-600">{value}</span>
            )}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
