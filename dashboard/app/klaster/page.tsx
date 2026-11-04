"use client";

import {
  BarChart3,
  Boxes,
  Gauge,
  Network,
  PieChart,
  ShieldCheck,
  Table2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { ChartCard } from "@/components/ui/chart-card";
import { TabCard } from "@/components/ui/tab-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ClusterExamples } from "@/components/ui/cluster-examples";
import { KpiRow, PageGrid, Panels } from "@/components/ui/page-grid";
import {
  ClusterCountBars,
  ClusterPerKapitaBar,
  ClusterProfileBar,
  ClusterProfileTable,
  ClusterScatter,
} from "@/components/charts/cluster-charts";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { formatNumber, formatPct } from "@/lib/format";

export default function ClusterPage() {
  const { filteredRegions, clusterSummary, profiles } = useDashboard();

  const largestCluster = [...clusterSummary].sort(
    (a, b) => b.count - a.count,
  )[0];
  const largestShare =
    filteredRegions.length > 0
      ? ((largestCluster?.count ?? 0) / filteredRegions.length) * 100
      : 0;
  const bestProfile = [...profiles].sort(
    (a, b) => b.medianPenanganan - a.medianPenanganan,
  )[0];

  if (filteredRegions.length === 0) {
    return (
      <PageGrid>
        <PageHeader
          eyebrow="Klaster wilayah"
          title="Empat segmen capaian pengelolaan sampah"
          description="Tidak ada wilayah yang cocok dengan filter saat ini."
          className="lg:col-span-12"
        />
        <div className="lg:col-span-12">
          <EmptyState description="Reset filter untuk melihat seluruh klaster." />
        </div>
      </PageGrid>
    );
  }

  return (
    <PageGrid>
      <PageHeader
        className="lg:col-span-4"
        eyebrow="Klaster wilayah"
        title={
          largestShare >= 50
            ? `${formatPct(largestShare, 0)} wilayah masih berada di segmen “${largestCluster.label}”`
            : `Segmen terbesar: “${largestCluster.label}” (${formatPct(largestShare, 0)} wilayah)`
        }
        description="K-Means (k=4) mengelompokkan kabupaten/kota berdasarkan pengurangan, penanganan, dan timbulan per kapita. Klaster bersifat deskriptif, bukan sebab-akibat."
      />

      <KpiRow>
        <KpiCard
          dark
          icon={Boxes}
          label="Wilayah dianalisis"
          value={`${formatNumber(filteredRegions.length)} wilayah`}
          helper="Data terfilter saat ini"
        />
        <KpiCard
          icon={Network}
          label="Klaster terbesar"
          value={largestCluster?.label ?? "-"}
          helper={`${formatNumber(largestCluster?.count ?? 0)} wilayah`}
        />
        <KpiCard
          icon={Gauge}
          label="Penanganan tertinggi"
          value={formatPct(bestProfile?.medianPenanganan ?? 0)}
          helper={`Median, ${bestProfile?.label ?? "-"}`}
        />
        <KpiCard
          icon={ShieldCheck}
          label="Stabilitas klaster"
          value="0,93"
          helper="ARI rata-rata, 100 bootstrap"
        />
      </KpiRow>

      <Panels>
        <ChartCard
          className="lg:col-span-5"
          icon={Network}
          title="Peta empat segmen wilayah"
          description="Satu titik = satu kabupaten/kota. Lingkaran putih = titik tengah klaster."
          footer="Cara membaca: kanan = lebih banyak sampah ditangani, atas = lebih banyak sampah per orang. Arahkan kursor ke legenda untuk menyorot satu klaster."
        >
          <ClusterScatter />
        </ChartCard>

        <div className="grid min-h-0 grid-rows-2 gap-3 lg:col-span-3">
          <ChartCard
            icon={PieChart}
            title="Jumlah wilayah per klaster"
            description="Klik batang untuk memfilter."
          >
            <ClusterCountBars />
          </ChartCard>
          <ChartCard
            icon={BarChart3}
            title="Median timbulan per kapita"
            description="kg/orang/hari per klaster."
          >
            <ClusterPerKapitaBar />
          </ChartCard>
        </div>

        <TabCard
          className="lg:col-span-4"
          icon={Table2}
          title="Profil klaster"
          tabs={[
            {
              key: "profil",
              label: "Profil",
              description: "Median tiap klaster; warna menandai kolom tertinggi.",
              footer: "Median dipakai agar tidak terpengaruh nilai ekstrem satu-dua wilayah.",
              content: <ClusterProfileTable />,
            },
            {
              key: "komposisi",
              label: "Komposisi",
              description: "Pembagian tonase: pengurangan, penanganan, tidak terkelola.",
              footer: "Dihitung dari agregasi tonase wilayah dalam tiap klaster. Klik baris untuk memfilter.",
              content: <ClusterProfileBar />,
            },
            {
              key: "contoh",
              label: "Contoh wilayah",
              description: "Tiga wilayah dengan timbulan terbesar di tiap segmen.",
              footer: "Klik wilayah untuk memfilter dashboard ke kabupaten/kota tersebut.",
              content: <ClusterExamples />,
            },
          ]}
        />
      </Panels>
    </PageGrid>
  );
}
