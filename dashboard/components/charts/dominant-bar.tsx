"use client";

import { BarList } from "@/components/charts/bar-list";
import { EmptyState } from "@/components/ui/empty-state";
import { useExpanded } from "@/components/ui/expandable";
import { formatNumber, formatPct } from "@/lib/format";

export interface DominantItem {
  key: string;
  label: string;
  count: number;
  color: string;
}

/**
 * Jumlah wilayah per kategori dominan. Diurutkan menurun, label dan nilai
 * langsung di batang; hanya kategori terbesar yang diberi warna aksen.
 */
export function DominantBar({
  items,
  total,
}: {
  items: DominantItem[];
  total: number;
  height?: number;
}) {
  const limit = useExpanded() ? items.length : 7;
  const data = items
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  if (data.length === 0) return <EmptyState />;

  return (
    <BarList
      ariaLabel="Jumlah wilayah per kategori dominan"
      items={data.map((item) => ({
        key: item.key,
        label: item.label,
        value: item.count,
        valueLabel:
          total > 0
            ? `${formatNumber(item.count)} \u00B7 ${formatPct((item.count / total) * 100, 0)}`
            : formatNumber(item.count),
      }))}
    />
  );
}
