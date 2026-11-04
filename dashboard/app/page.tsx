"use client";

import {
  BarChart3,
  Boxes,
  Gauge,
  PieChart,
  Recycle,
  Trash2,
  TriangleAlert,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { ChartCard } from "@/components/ui/chart-card";
import { InsightPanel } from "@/components/ui/insight-panel";
import { EmptyState } from "@/components/ui/empty-state";
import { ClusterSummaryCards } from "@/components/ui/cluster-summary-cards";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  ManagementDonut,
  ProvinceTimbulanBar,
} from "@/components/charts/overview-charts";
import { ManagementDistribution } from "@/components/charts/distribution-charts";
import { useDashboard } from "@/components/providers/dashboard-provider";
import {
  formatCompactTon,
  formatNumber,
  formatPct,
  formatPerKapita,
} from "@/lib/format";

export default function OverviewPage() {
  const {
    national,
    provinces,
    profiles,
    filteredRegions,
    activeFilterCount,
  } = useDashboard();

  const topProvince = provinces[0];
  const worstProvince = [...provinces].sort(
    (a, b) => b.pctTidakTerkelola - a.pctTidakTerkelola,
  )[0];
  const bestCluster = [...profiles].sort(
    (a, b) => b.medianPenanganan - a.medianPenanganan,
  )[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ringkasan nasional"
        title="Gambaran pengelolaan sampah Indonesia"
        description={`Analisis ${formatNumber(national.nWilayah)} kabupaten/kota berdasarkan data SIPSN KLHK 2025. ${
          activeFilterCount > 0
            ? "Angka mengikuti filter yang sedang aktif."
            : "Angka nasional dihitung dari seluruh wilayah dalam dataset."
        }`}
      />

      {filteredRegions.length === 0 ? (
        <EmptyState description="Tidak ada wilayah yang cocok dengan kombinasi filter saat ini. Reset filter untuk melihat ringkasan nasional." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon={Trash2}
              label="Total timbulan"
              value={formatCompactTon(national.timbulan)}
              helper={`${formatNumber(national.nWilayah)} wilayah · ${formatCompactTon(
                national.timbulan / 365,
              )} per hari`}
              tone="blue"
            />
            <KpiCard
              icon={Recycle}
              label="Sampah terkelola"
              value={formatCompactTon(national.terkelola)}
              helper={`${formatPct(national.pctTerkelola)} dari total timbulan`}
              tone="teal"
            />
            <KpiCard
              icon={TriangleAlert}
              label="Tidak terkelola"
              value={formatCompactTon(national.tidakTerkelola)}
              helper={`${formatPct(national.pctTidakTerkelola)} dari total timbulan`}
              tone="amber"
            />
            <KpiCard
              icon={Gauge}
              label="Rasio pengelolaan"
              value={formatPct(national.pctTerkelola)}
              helper={`${formatPerKapita(national.perKapita)} rata-rata timbulan per kapita`}
              tone="navy"
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <ChartCard
              icon={BarChart3}
              title="10 provinsi dengan timbulan terbesar"
              description="Batang dibagi menjadi volume terkelola dan tidak terkelola. Klik provinsi untuk memfilter dashboard."
              className="lg:col-span-2"
              footer="Panjang total batang menunjukkan timbulan tahunan; warna biru menunjukkan bagian terkelola."
            >
              <ProvinceTimbulanBar />
            </ChartCard>
            <ChartCard
              icon={PieChart}
              title="Proporsi pengelolaan"
              description="Perbandingan volume sampah terkelola dan tidak terkelola."
              footer="Tidak terkelola adalah selisih timbulan tahunan dengan sampah terkelola, bukan bukti sampah dibuang sembarangan."
            >
              <ManagementDonut />
            </ChartCard>
          </div>

          <section>
            <SectionHeading
              icon={Boxes}
              title="Sebaran klaster wilayah"
              description="Empat segmen hasil K-Means. Klik kartu untuk memfilter dashboard."
            />
            <ClusterSummaryCards />
          </section>

          <div className="grid gap-5 lg:grid-cols-3">
            <ChartCard
              icon={Gauge}
              title="Sebaran capaian pengelolaan"
              description="Jumlah wilayah pada setiap rentang persentase sampah terkelola."
              className="lg:col-span-2"
              footer="Distribusi membantu melihat apakah capaian nasional ditopang banyak wilayah atau hanya beberapa wilayah dengan capaian tinggi."
            >
              <ManagementDistribution />
            </ChartCard>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                <Users className="h-5 w-5 text-blue-600" />
                Konteks penduduk
              </div>
              <p className="mt-4 text-3xl font-semibold text-slate-950">
                {formatNumber(national.penduduk)}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                jiwa tercakup dalam wilayah terfilter
              </p>
              <div className="mt-5 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-500">
                Timbulan per kapita rata-rata{" "}
                <span className="font-semibold text-slate-800">
                  {formatPerKapita(national.perKapita)}
                </span>
                . Nilai ini merupakan estimasi, bukan pengukuran langsung
                produksi sampah setiap individu.
              </div>
            </div>
          </div>

          <InsightPanel title="Bacaan cepat">
            Dari {formatNumber(national.nWilayah)} wilayah,{" "}
            <strong>{formatPct(national.pctTerkelola)}</strong> timbulan
            tercatat terkelola. {topProvince?.provinsi} menyumbang timbulan
            terbesar ({formatCompactTon(topProvince?.timbulan ?? 0)}),
            sedangkan {worstProvince?.provinsi} memiliki proporsi tidak
            terkelola tertinggi (
            {formatPct(worstProvince?.pctTidakTerkelola ?? 0)}). Kelompok{" "}
            <strong>{bestCluster?.label}</strong> memiliki median penanganan
            tertinggi ({formatPct(bestCluster?.medianPenanganan ?? 0)}).
          </InsightPanel>
        </>
      )}
    </div>
  );
}
