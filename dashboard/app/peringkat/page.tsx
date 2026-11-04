"use client";

import {
  BarChart3,
  Gauge,
  ListOrdered,
  Table2,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { ChartCard } from "@/components/ui/chart-card";
import { TabCard } from "@/components/ui/tab-card";
import { DataTable } from "@/components/ui/data-table";
import { KpiRow, PageGrid, Panels } from "@/components/ui/page-grid";
import {
  TopPerKapitaRegionsBar,
  TopTimbulanRegionsBar,
} from "@/components/charts/ranking-charts";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { formatCompactTon, formatNumber, formatPct } from "@/lib/format";

export default function RankingPage() {
  const { filteredRegions, national, filters } = useDashboard();
  const topRegion = [...filteredRegions].sort(
    (a, b) => b.timbulanTahunan - a.timbulanTahunan,
  )[0];

  return (
    <PageGrid>
      <PageHeader
        className="lg:col-span-4"
        eyebrow="Peringkat dan tabel"
        title={
          topRegion
            ? `${topRegion.kabKota} menghasilkan sampah terbanyak (${formatCompactTon(topRegion.timbulanTahunan)})`
            : "Telusuri wilayah satu per satu"
        }
        description="Seluruh kabupaten/kota dalam dataset. Gunakan filter di atas untuk mempersempit, urutkan kolom, lalu ekspor hasilnya."
      />

      <KpiRow>
        <KpiCard
          dark
          icon={Table2}
          label="Wilayah terfilter"
          value={`${formatNumber(filteredRegions.length)} wilayah`}
          helper="Mengikuti filter aktif"
        />
        <KpiCard
          icon={Trash2}
          label="Total timbulan"
          value={formatCompactTon(national.timbulan)}
          helper="Penjumlahan wilayah terfilter"
        />
        <KpiCard
          icon={TriangleAlert}
          label="Tidak terkelola"
          value={formatCompactTon(national.tidakTerkelola)}
          helper={formatPct(national.pctTidakTerkelola)}
          tone="rose"
        />
        <KpiCard
          icon={Gauge}
          label="Rasio pengelolaan"
          value={formatPct(national.pctTerkelola)}
          helper="Terkelola dibagi timbulan"
        />
      </KpiRow>

      <Panels>
        <TabCard
          className="lg:col-span-4"
          icon={BarChart3}
          title="Sorotan wilayah"
          tabs={[
            {
              key: "timbulan",
              label: "Timbulan terbesar",
              description: "10 wilayah; klik batang untuk memfilter.",
              footer: "Warna batang mengikuti klaster wilayah.",
              content: <TopTimbulanRegionsBar />,
            },
            {
              key: "kapita",
              label: "Per kapita tertinggi",
              description: "10 wilayah; garis putus-putus = rata-rata filter aktif.",
              footer: "Per kapita = estimasi timbulan dibagi jumlah penduduk.",
              content: <TopPerKapitaRegionsBar />,
            },
          ]}
        />

        <ChartCard
          className="lg:col-span-8"
          icon={ListOrdered}
          title="Tabel peringkat kabupaten/kota"
          description="Klik judul kolom untuk mengurutkan. Badge warna = klaster."
          footer="Angka tidak terkelola adalah estimasi dari indikator SIPSN, bukan bukti tujuan akhir sampah."
          bodyClassName="overflow-hidden"
        >
          <DataTable
            key={`${filters.provinsi}-${filters.cluster}-${filters.search}`}
          />
        </ChartCard>
      </Panels>
    </PageGrid>
  );
}
