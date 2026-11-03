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
import {
  ManagementDonut,
  ProvinceTimbulanBar,
} from "@/components/charts/overview-charts";
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
    <div>
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
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <ChartCard
              icon={BarChart3}
              title="10 provinsi dengan timbulan terbesar"
              description="Klik salah satu batang untuk memfilter seluruh dashboard ke provinsi tersebut."
              className="lg:col-span-2"
              footer="Timbulan tahunan dihitung dari penjumlahan kabupaten/kota yang tersedia di dataset."
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

          <section className="mt-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Boxes className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Sebaran klaster wilayah
                </h2>
                <p className="text-xs text-slate-500">
                  Empat segmen hasil K-Means. Klik kartu untuk memfilter
                  dashboard.
                </p>
              </div>
            </div>
            <ClusterSummaryCards />
          </section>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <InsightPanel title="Bacaan cepat" className="lg:col-span-2">
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
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Users className="h-4 w-4 text-blue-600" />
                Konteks penduduk
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-950">
                {formatNumber(national.penduduk)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                jiwa tercakup dalam wilayah terfilter
              </p>
              <div className="mt-4 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">
                Timbulan per kapita rata-rata{" "}
                <span className="font-semibold text-slate-800">
                  {formatPerKapita(national.perKapita)}
                </span>
                . Nilai ini merupakan estimasi, bukan pengukuran langsung
                produksi sampah setiap individu.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
