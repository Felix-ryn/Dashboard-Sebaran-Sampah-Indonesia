import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import { cache } from "react";
import { CLUSTER_META } from "@/lib/constants";
import { median } from "@/lib/format";
import {
  COMPOSITION_KEYS,
  SOURCE_KEYS,
  type ClusterId,
  type ClusterProfile,
  type CompositionKey,
  type CompositionRow,
  type DashboardData,
  type Region,
  type SourceKey,
  type SourceRow,
} from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");

type CsvRow = Record<string, string | undefined>;

function readCsv(fileName: string): CsvRow[] {
  const content = fs.readFileSync(path.join(DATA_DIR, fileName), "utf8");
  const parsed = Papa.parse<CsvRow>(content, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data.filter((row) =>
    Object.values(row).some((value) => value && value.trim() !== ""),
  );
}

function toNumber(value: string | undefined): number {
  if (value === undefined || value === null) return 0;
  const cleaned = String(value).trim();
  if (!cleaned) return 0;
  const parsed = Number(cleaned.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function regionKey(provinsi: string, kabKota: string): string {
  return `${provinsi}|||${kabKota}`;
}

function dominantKey<T extends string>(
  values: Record<T, number>,
  keys: readonly T[],
): T {
  return keys.reduce((best, key) =>
    values[key] > values[best] ? key : best,
  );
}

function buildRegions(): Region[] {
  const baseRows = readCsv("sampah_2025_bersih.csv");
  const clusterRows = readCsv("hasil_clustering_sampah_2025.csv");
  const clusterMap = new Map(
    clusterRows.map((row) => [
      regionKey(row.provinsi ?? "", row.kab_kota ?? ""),
      row,
    ]),
  );

  return baseRows.map((row) => {
    const provinsi = row.provinsi ?? "";
    const kabKota = row.kab_kota ?? "";
    const clusterRow = clusterMap.get(regionKey(provinsi, kabKota));
    const clusterValue = Number(clusterRow?.cluster ?? 0);
    const cluster = (
      [0, 1, 2, 3].includes(clusterValue) ? clusterValue : 0
    ) as ClusterId;

    return {
      provinsi,
      kabKota,
      cluster,
      labelCluster:
        clusterRow?.label_cluster?.trim() ||
        CLUSTER_META.find((item) => item.id === cluster)?.label ||
        "Belum terkelola",
      penduduk: toNumber(row.jumlah_penduduk),
      timbulanHarian: toNumber(row.timbulan_harian),
      timbulanTahunan: toNumber(row.timbulan_tahunan),
      penguranganTon: toNumber(row.pengurangan_ton),
      pctPengurangan: toNumber(row.pct_pengurangan),
      penangananTon: toNumber(row.penanganan_ton),
      pctPenanganan: toNumber(row.pct_penanganan),
      terkelolaTon: toNumber(row.terkelola_ton),
      pctTerkelola: toNumber(row.pct_terkelola),
      tidakTerkelolaTon: toNumber(row.tidak_terkelola_ton),
      pctTidakTerkelola: toNumber(row.pct_tidak_terkelola),
      perKapita: toNumber(row.timbulan_per_kapita),
      pca1: toNumber(clusterRow?.pca1),
      pca2: toNumber(clusterRow?.pca2),
    };
  });
}

function buildCompositions(): CompositionRow[] {
  return readCsv("komposisi_bersih.csv").flatMap((row) => {
    if (!row.sisa_makanan?.trim()) return [];

    const values = {} as Record<CompositionKey, number>;
    for (const key of COMPOSITION_KEYS) {
      values[key] = toNumber(row[key]);
    }

    const computedTotal = COMPOSITION_KEYS.reduce(
      (sum, key) => sum + values[key],
      0,
    );
    const totalPct = toNumber(row.total_pct) || computedTotal;
    const providedDominant = row.jenis_dominan?.trim() as
      | CompositionKey
      | undefined;

    return [
      {
        provinsi: row.provinsi ?? "",
        kabKota: row.kab_kota ?? "",
        values,
        totalPct,
        jenisDominan:
          providedDominant && COMPOSITION_KEYS.includes(providedDominant)
            ? providedDominant
            : dominantKey(values, COMPOSITION_KEYS),
      },
    ];
  });
}

function buildSources(regions: Region[]): SourceRow[] {
  const regionMap = new Map(
    regions.map((region) => [
      regionKey(region.provinsi, region.kabKota),
      region,
    ]),
  );

  return readCsv("sumber_bersih.csv").flatMap((row) => {
    const values = {} as Record<SourceKey, number>;
    for (const key of SOURCE_KEYS) {
      values[key] = toNumber(row[key]);
    }

    const computedTotal = SOURCE_KEYS.reduce(
      (sum, key) => sum + values[key],
      0,
    );
    const totalTonHari = toNumber(row.total_ton_hari) || computedTotal;
    if (totalTonHari <= 0) return [];

    const region = regionMap.get(
      regionKey(row.provinsi ?? "", row.kab_kota ?? ""),
    );
    const ratioToTimbulan =
      region && region.timbulanHarian > 0
        ? totalTonHari / region.timbulanHarian
        : 0;
    const isAnomaly =
      !region ||
      ratioToTimbulan < 0.2 ||
      ratioToTimbulan > 5;

    const providedDominant = row.sumber_dominan?.trim() as
      | SourceKey
      | undefined;

    return [
      {
        provinsi: row.provinsi ?? "",
        kabKota: row.kab_kota ?? "",
        values,
        totalTonHari,
        sumberDominan:
          providedDominant && SOURCE_KEYS.includes(providedDominant)
            ? providedDominant
            : dominantKey(values, SOURCE_KEYS),
        ratioToTimbulan,
        isAnomaly,
      },
    ];
  });
}

function buildProfiles(regions: Region[]): ClusterProfile[] {
  return CLUSTER_META.map((meta) => {
    const group = regions.filter((region) => region.cluster === meta.id);
    return {
      cluster: meta.id,
      label: meta.label,
      jumlahWilayah: group.length,
      medianPenduduk: median(group.map((region) => region.penduduk)),
      medianPerKapita: median(group.map((region) => region.perKapita)),
      medianPengurangan: median(
        group.map((region) => region.pctPengurangan),
      ),
      medianPenanganan: median(group.map((region) => region.pctPenanganan)),
      medianTidakTerkelola: median(
        group.map((region) => region.pctTidakTerkelola),
      ),
    };
  });
}

export const getDashboardData = cache((): DashboardData => {
  const regions = buildRegions();
  return {
    regions,
    compositions: buildCompositions(),
    sources: buildSources(regions),
    profiles: buildProfiles(regions),
  };
});
