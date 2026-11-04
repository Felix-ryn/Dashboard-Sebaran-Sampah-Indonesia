"use client";

import {
  BarChart3,
  Database,
  Layers,
  PieChart,
  Store,
  Truck,
  TriangleAlert,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { ChartCard } from "@/components/ui/chart-card";
import { EmptyState } from "@/components/ui/empty-state";
import { KpiRow, PageGrid, Panels } from "@/components/ui/page-grid";
import { DominantBar } from "@/components/charts/dominant-bar";
import {
  SourceBars,
  SourceHeatTable,
} from "@/components/charts/source-charts";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { formatNumber, formatPct, formatTon } from "@/lib/format";

export default function SourcePage() {
  const {
    sourceAvg,
    dominantSources,
    filteredSources,
    excludedSourceCount,
    data,
  } = useDashboard();

  const topSource = [...sourceAvg].sort((a, b) => b.value - a.value)[0];
  const totalTon = sourceAvg.reduce((sum, item) => sum + item.ton, 0);

  if (filteredSources.length === 0) {
    return (
      <PageGrid>
        <PageHeader
          eyebrow="Sumber sampah"
          title="Dari mana sampah berasal"
          description="Tidak ada baris sumber yang lolos penyaringan anomali pada filter saat ini."
          className="lg:col-span-12"
        />
        <div className="lg:col-span-12">
          <EmptyState
            title="Data sumber tidak tersedia"
            description="Coba pilih provinsi lain atau reset filter."
          />
        </div>
      </PageGrid>
    );
  }

  return (
    <PageGrid>
      <PageHeader
        className="lg:col-span-4"
        eyebrow="Sumber sampah"
        title={
          topSource
            ? `${topSource.label} adalah sumber sampah terbesar (${formatPct(topSource.value, 0)})`
            : "Dari mana sampah berasal"
        }
        description="Hanya baris yang konsisten dengan timbulan harian wilayah (rasio 0,2–5×) yang dipakai, supaya anomali satuan tidak mendistorsi grafik."
      />

      <KpiRow>
        <KpiCard
          dark
          icon={Store}
          label="Sumber dominan"
          value={topSource?.label ?? "-"}
          helper={`${formatPct(topSource?.value ?? 0)} dari total sumber`}
        />
        <KpiCard
          icon={Truck}
          label="Total sumber"
          value={formatTon(totalTon, 0)}
          helper="Ton per hari, baris lolos filter"
        />
        <KpiCard
          icon={Database}
          label="Wilayah dengan data"
          value={`${formatNumber(filteredSources.length)} wilayah`}
          helper={`${formatNumber(data.sources.length)} baris tidak kosong`}
        />
        <KpiCard
          icon={TriangleAlert}
          label="Baris dikecualikan"
          value={`${formatNumber(excludedSourceCount)} baris`}
          helper="Di luar 0,2–5× timbulan harian"
          tone="amber"
        />
      </KpiRow>

      <Panels>
        <ChartCard
          className="lg:col-span-3"
          icon={PieChart}
          title="Proporsi sumber"
          description="Kontribusi tiap sumber, dari terbesar."
          footer="Penjumlahan ton/hari pada baris yang lolos penyaringan."
        >
          <SourceBars />
        </ChartCard>
        <ChartCard
          className="lg:col-span-3"
          icon={Layers}
          title="Sumber dominan per wilayah"
          description="Jumlah wilayah per sumber terbesar."
          footer="Anomali pada data mentah: ribuan ton/hari untuk wilayah yang timbulannya hanya puluhan."
        >
          <DominantBar items={dominantSources} total={filteredSources.length} />
        </ChartCard>
        <ChartCard
          className="lg:col-span-6"
          icon={BarChart3}
          title="Proporsi sumber per provinsi"
          description="Delapan provinsi dengan total terbesar. Klik baris untuk memfilter."
          footer="Angka = persen sumber pada provinsi itu; warna dibandingkan antarprovinsi pada tiap sumber."
        >
          <SourceHeatTable />
        </ChartCard>
      </Panels>
    </PageGrid>
  );
}
