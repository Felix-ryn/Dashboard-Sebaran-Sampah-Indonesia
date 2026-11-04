"use client";

import {
  ArrowDownRight,
  BarChart3,
  MapPin,
  Percent,
  ScatterChart,
  TriangleAlert,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { ChartCard } from "@/components/ui/chart-card";
import { TabCard } from "@/components/ui/tab-card";
import { EmptyState } from "@/components/ui/empty-state";
import { KpiRow, PageGrid, Panels } from "@/components/ui/page-grid";
import {
  GapRanking,
  GapScatter,
  ProvinceGapBar,
} from "@/components/charts/gap-charts";
import { GapDistribution } from "@/components/charts/distribution-charts";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { formatCompactTon, formatNumber, formatPct } from "@/lib/format";

export default function GapPage() {
  const { national, filteredRegions, provinces } = useDashboard();
  const highGapCount = filteredRegions.filter(
    (region) => region.pctTidakTerkelola > 50,
  ).length;
  const worstProvince = [...provinces].sort(
    (a, b) => b.pctTidakTerkelola - a.pctTidakTerkelola,
  )[0];

  if (filteredRegions.length === 0) {
    return (
      <PageGrid>
        <PageHeader
          eyebrow="Kesenjangan pengelolaan"
          title="Sampah yang belum tercatat terkelola"
          description="Tidak ada wilayah yang cocok dengan filter saat ini."
          className="lg:col-span-12"
        />
        <div className="lg:col-span-12">
          <EmptyState description="Reset filter untuk melihat kesenjangan nasional." />
        </div>
      </PageGrid>
    );
  }

  return (
    <PageGrid>
      <PageHeader
        className="lg:col-span-4"
        eyebrow="Kesenjangan pengelolaan"
        title={`${formatNumber(highGapCount)} dari ${formatNumber(filteredRegions.length)} wilayah belum mengelola separuh timbulannya`}
        description="Dua pertanyaan berbeda: seberapa besar volume yang tidak terkelola, dan seberapa besar proporsinya terhadap timbulan wilayah itu sendiri."
      />

      <KpiRow>
        <KpiCard
          dark
          icon={ArrowDownRight}
          label="Volume tidak terkelola"
          value={formatCompactTon(national.tidakTerkelola)}
          helper="Selisih timbulan dengan sampah terkelola"
        />
        <KpiCard
          icon={Percent}
          label="Proporsi tidak terkelola"
          value={formatPct(national.pctTidakTerkelola)}
          helper={`Dari total ${formatCompactTon(national.timbulan)}`}
          tone="rose"
        />
        <KpiCard
          icon={TriangleAlert}
          label="Wilayah di atas 50%"
          value={`${formatNumber(highGapCount)} wilayah`}
          helper="Lebih dari separuh timbulan tak terkelola"
        />
        <KpiCard
          icon={MapPin}
          label="Provinsi tertinggi"
          value={worstProvince?.provinsi ?? "-"}
          helper={`${formatPct(worstProvince?.pctTidakTerkelola ?? 0)} tidak terkelola`}
        />
      </KpiRow>

      <Panels>
        <ChartCard
          className="lg:col-span-5"
          icon={ScatterChart}
          title="Wilayah mana yang perlu diprioritaskan?"
          description="Satu titik = satu kabupaten/kota. Zona oranye = banyak sampah, sedikit terkelola."
          footer="Zona prioritas: kurang dari 50% terkelola dan termasuk 20% volume tak terkelola terbesar. Nama = 5 wilayah terbesar di zona itu."
        >
          <GapScatter />
        </ChartCard>

        <TabCard
          className="lg:col-span-4"
          icon={BarChart3}
          title="Peringkat kesenjangan"
          tabs={[
            {
              key: "provinsi",
              label: "Provinsi",
              description: "Volume tidak terkelola terbesar. Klik batang untuk memfilter.",
              footer: "Volume besar belum tentu berarti proporsi besar; lihat tab Wilayah (persentase).",
              content: <ProvinceGapBar />,
            },
            {
              key: "wilayah",
              label: "Wilayah",
              description: "10 kabupaten/kota; ganti antara volume dan persentase.",
              footer: "Volume menjawab skala masalah; persentase menjawab tingkat keparahan relatif.",
              content: <GapRanking />,
            },
          ]}
        />

        <ChartCard
          className="lg:col-span-3"
          icon={Percent}
          title="Sebaran proporsi tidak terkelola"
          description="Jumlah wilayah menurut tingkat kesenjangan."
          footer="Makin ke kanan, makin besar bagian timbulan yang belum tercatat terkelola."
        >
          <GapDistribution />
        </ChartCard>
      </Panels>
    </PageGrid>
  );
}
