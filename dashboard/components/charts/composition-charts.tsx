"use client";

import {
  COMPOSITION_LABELS,
} from "@/lib/constants";
import { formatPct } from "@/lib/format";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { BarList } from "@/components/charts/bar-list";
import { HeatTable } from "@/components/charts/heat-table";
import { COMPOSITION_KEYS } from "@/lib/types";

export function CompositionBars() {
  const { compositionAvg } = useDashboard();
  const data = [...compositionAvg]
    .filter((item) => item.value > 0.05)
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return <EmptyState />;
  }

  return (
    <BarList
      ariaLabel="Komposisi rata-rata sampah"
      items={data.map((item) => ({
        key: item.key,
        label: item.label,
        value: item.value,
        valueLabel: formatPct(item.value),
      }))}
    />
  );
}

export function CompositionHeatTable() {
  const { compositionProvinces, setProvinsi, filters } = useDashboard();

  if (compositionProvinces.length === 0) {
    return <EmptyState />;
  }

  return (
    <HeatTable
      rowHeader="Provinsi"
      activeKey={filters.provinsi}
      onSelect={(key) =>
        setProvinsi(filters.provinsi === key ? "all" : String(key))
      }
      columns={COMPOSITION_KEYS.map((key) => ({
        key,
        label: COMPOSITION_LABELS[key],
        format: (value: number) => formatPct(value, 0),
      }))}
      rows={compositionProvinces.map((province) => ({
        key: province.provinsi,
        label: province.provinsi,
        values: COMPOSITION_KEYS.map((key) => province.values[key]),
      }))}
    />
  );
}

