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
import { InsightPanel } from "@/components/ui/insight-panel";
import { DataTable } from "@/components/ui/data-table";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  TopPerKapitaRegionsBar,
  TopTimbulanRegionsBar,
} from "@/components/charts/ranking-charts";
import { useDashboard } from "@/components/providers/dashboard-provider";
import {
  formatCompactTon,
  formatNumber,
  formatPct,
} from "@/lib/format";

export default function RankingPage() {
  const { filteredRegions, national, filters } = useDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Peringkat dan tabel"
        title="Telusuri wilayah satu per satu"
        description="Tabel interaktif berisi seluruh kabupaten/kota pada dataset. Gunakan filter global untuk mempersempit wilayah, lalu urutkan kolom dan ekspor hasilnya."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Table2}
          label="Wilayah terfilter"
          value={`${formatNumber(filteredRegions.length)} wilayah`}
          helper="Data mengikuti filter aktif"
          tone="blue"
        />
        <KpiCard
          icon={Trash2}
          label="Total timbulan"
          value={formatCompactTon(national.timbulan)}
          helper="Penjumlahan wilayah terfilter"
          tone="navy"
        />
        <KpiCard
          icon={TriangleAlert}
          label="Tidak terkelola"
          value={formatCompactTon(national.tidakTerkelola)}
          helper={formatPct(national.pctTidakTerkelola)}
          tone="amber"
        />
        <KpiCard
          icon={Gauge}
          label="Rasio pengelolaan"
          value={formatPct(national.pctTerkelola)}
          helper="Terkelola dibagi timbulan"
          tone="teal"
        />
      </div>

      <section>
        <SectionHeading
          icon={BarChart3}
          title="Sorotan wilayah"
          description="Dua sudut pandang untuk menemukan wilayah dengan beban timbulan dan intensitas per kapita tertinggi."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          <ChartCard
            icon={Trash2}
            title="10 wilayah dengan timbulan terbesar"
            description="Klik batang untuk memfilter dashboard ke wilayah tersebut."
            footer="Warna batang mengikuti klaster masing-masing wilayah."
          >
            <TopTimbulanRegionsBar />
          </ChartCard>
          <ChartCard
            icon={Gauge}
            title="10 wilayah dengan per kapita tertinggi"
            description="Garis putus-putus menunjukkan rata-rata per kapita pada filter aktif."
            footer="Per kapita dihitung dari estimasi timbulan dibagi jumlah penduduk."
          >
            <TopPerKapitaRegionsBar />
          </ChartCard>
        </div>
      </section>

      <div>
        <ChartCard
          icon={ListOrdered}
          title="Tabel peringkat kabupaten/kota"
          description="Klik judul kolom untuk mengurutkan. Badge warna menunjukkan klaster wilayah."
          footer="Angka tidak terkelola adalah estimasi berdasarkan indikator SIPSN, bukan bukti tujuan akhir sampah."
        >
          <DataTable
            key={`${filters.provinsi}-${filters.cluster}-${filters.search}`}
          />
        </ChartCard>
      </div>

      <div>
        <InsightPanel title="Tips eksplorasi">
          Urutkan kolom <strong>% Tidak terkelola</strong> menurun untuk
          menemukan wilayah dengan proporsi kesenjangan tertinggi. Urutkan
          kolom <strong>Timbulan/tahun</strong> untuk melihat wilayah dengan
          beban volume terbesar. Gunakan tombol ekspor CSV untuk mengolah
          hasil filter di spreadsheet.
        </InsightPanel>
      </div>
    </div>
  );
}
