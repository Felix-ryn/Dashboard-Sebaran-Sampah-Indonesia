"use client";

import { SOURCE_LABELS } from "@/lib/constants";
import { formatPct } from "@/lib/format";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { BarList } from "@/components/charts/bar-list";
import { HeatTable } from "@/components/charts/heat-table";
import { SOURCE_KEYS } from "@/lib/types";

export function SourceBars() {
  const { sourceAvg } = useDashboard();
  const data = [...sourceAvg]
    .filter((item) => item.value > 0.05)
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return <EmptyState />;
  }

  return (
    <BarList
      ariaLabel="Proporsi sumber sampah"
      items={data.map((item) => ({
        key: item.key,
        label: item.label,
        value: item.value,
        valueLabel: formatPct(item.value),
      }))}
    />
  );
}

export function SourceHeatTable() {
  const { sourceProvinces, setProvinsi, filters } = useDashboard();

  if (sourceProvinces.length === 0) {
    return <EmptyState />;
  }

  return (
    <HeatTable
      rowHeader="Provinsi"
      activeKey={filters.provinsi}
      onSelect={(key) =>
        setProvinsi(filters.provinsi === key ? "all" : String(key))
      }
      columns={SOURCE_KEYS.map((key) => ({
        key,
        label: SOURCE_LABELS[key],
        format: (value: number) => formatPct(value, 0),
      }))}
      rows={sourceProvinces.map((province) => ({
        key: province.provinsi,
        label: province.provinsi,
        values: SOURCE_KEYS.map((key) => province.values[key]),
      }))}
    />
  );
}

