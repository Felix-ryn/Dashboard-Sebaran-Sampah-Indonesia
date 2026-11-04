"use client";

import {
  BarChart3,
  Boxes,
  Gauge,
  PieChart,
  Recycle,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { ChartCard } from "@/components/ui/chart-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ClusterSummaryCards } from "@/components/ui/cluster-summary-cards";
import { KpiRow, PageGrid, Panels } from "@/components/ui/page-grid";
import {
  ManagementShare,
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
  const { national, provinces, profiles, filteredRegions, activeFilterCount } =
    useDashboard();

  const topProvince = provinces[0];
  const worstProvince = [...provinces].sort(
    (a, b) => b.pctTidakTerkelola - a.pctTidakTerkelola,
  )[0];
  const bestCluster = [...profiles].sort(
    (a, b) => b.medianPenanganan - a.medianPenanganan,
  )[0];

  if (filteredRegions.length === 0) {
    return (
      <PageGrid>
        <PageHeader
          eyebrow="Ringkasan nasional"
          title="Gambaran pengelolaan sampah Indonesia"
          description="Tidak ada wilayah yang cocok dengan filter saat ini."
          className="lg:col-span-12"
        />
        <div className="lg:col-span-12">
          <EmptyState description="Reset filter untuk melihat ringkasan nasional." />
        </div>
      </PageGrid>
    );
  }

  return (
    <PageGrid>
      <PageHeader
        className="lg:col-span-4"
        eyebrow="Ringkasan nasional"
        title={`${formatPct(national.pctTidakTerkelola, 0)} sampah belum tercatat terkelola`}
        description={`${topProvince?.provinsi} menyumbang timbulan terbesar; ${worstProvince?.provinsi} memiliki proporsi tidak terkelola tertinggi (${formatPct(worstProvince?.pctTidakTerkelola ?? 0)}). Segmen ${bestCluster?.label} paling baik (penanganan median ${formatPct(bestCluster?.medianPenanganan ?? 0)}).${activeFilterCount > 0 ? " Angka mengikuti filter aktif." : ""}`}
      />

      <KpiRow>
        <KpiCard
          dark
          icon={Trash2}
          label="Total timbulan"
          value={formatCompactTon(national.timbulan)}
          helper={`${formatNumber(national.nWilayah)} wilayah · ${formatCompactTon(national.timbulan / 365)}/hari`}
        />
        <KpiCard
          icon={Recycle}
          label="Sampah terkelola"
          value={formatCompactTon(national.terkelola)}
          helper={`${formatPct(national.pctTerkelola)} dari total timbulan`}
        />
        <KpiCard
          icon={TriangleAlert}
          label="Tidak terkelola"
          value={formatCompactTon(national.tidakTerkelola)}
          helper={`${formatPct(national.pctTidakTerkelola)} dari total timbulan`}
          tone="rose"
        />
        <KpiCard
          icon={Gauge}
          label="Rasio pengelolaan"
          value={formatPct(national.pctTerkelola)}
          helper={`${formatPerKapita(national.perKapita)} rata-rata`}
        />
      </KpiRow>

      <Panels>
        <ChartCard
          className="lg:col-span-5"
          icon={BarChart3}
          title="10 provinsi dengan timbulan terbesar"
          description="Batang dibagi terkelola dan tidak terkelola. Klik provinsi untuk memfilter."
          footer="Panjang total batang = timbulan tahunan; biru = bagian terkelola."
        >
          <ProvinceTimbulanBar />
        </ChartCard>

        <ChartCard
          className="lg:col-span-4"
          icon={Gauge}
          title="Sebaran capaian pengelolaan"
          description="Jumlah wilayah pada setiap rentang % sampah terkelola."
          footer="Sebagian besar wilayah masih di rentang terendah, bukan hanya segelintir."
        >
          <ManagementDistribution />
        </ChartCard>

        <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3 lg:col-span-3">
          <ChartCard
            icon={PieChart}
            title="Berapa yang terkelola?"
            footer="Tidak terkelola = selisih timbulan dan sampah terkelola, bukan bukti dibuang sembarangan."
          >
            <ManagementShare />
          </ChartCard>
          <ChartCard
            icon={Boxes}
            title="Segmen klaster"
            description="Klik kartu untuk memfilter."
          >
            <ClusterSummaryCards />
          </ChartCard>
        </div>
      </Panels>
    </PageGrid>
  );
}
