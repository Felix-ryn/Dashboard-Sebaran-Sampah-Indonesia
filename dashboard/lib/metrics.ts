import {
  CLUSTER_META,
  COMPOSITION_COLORS,
  COMPOSITION_LABELS,
  SOURCE_COLORS,
  SOURCE_LABELS,
} from "@/lib/constants";
import { median, ratio } from "@/lib/format";
import {
  COMPOSITION_KEYS,
  SOURCE_KEYS,
  type ClusterId,
  type ClusterProfile,
  type CompositionAverage,
  type CompositionKey,
  type CompositionRow,
  type NationalAggregate,
  type ProvinceAggregate,
  type Region,
  type SourceAverage,
  type SourceKey,
  type SourceRow,
} from "@/lib/types";

export type RegionMetric =
  | "timbulanTahunan"
  | "tidakTerkelolaTon"
  | "pctTidakTerkelola"
  | "pctTerkelola"
  | "perKapita"
  | "penduduk"
  | "pctPengurangan"
  | "pctPenanganan";

export function aggregateNational(regions: Region[]): NationalAggregate {
  const timbulan = regions.reduce(
    (sum, region) => sum + region.timbulanTahunan,
    0,
  );
  const terkelola = regions.reduce(
    (sum, region) => sum + region.terkelolaTon,
    0,
  );
  const tidakTerkelola = regions.reduce(
    (sum, region) => sum + region.tidakTerkelolaTon,
    0,
  );
  const penduduk = regions.reduce(
    (sum, region) => sum + region.penduduk,
    0,
  );

  return {
    timbulan,
    terkelola,
    tidakTerkelola,
    pctTerkelola: ratio(terkelola, timbulan),
    pctTidakTerkelola: ratio(tidakTerkelola, timbulan),
    penduduk,
    perKapita: penduduk > 0 ? (timbulan * 1000) / (penduduk * 365) : 0,
    nWilayah: regions.length,
  };
}

export function aggregateProvinces(
  regions: Region[],
): ProvinceAggregate[] {
  const groups = new Map<string, Region[]>();

  for (const region of regions) {
    const list = groups.get(region.provinsi) ?? [];
    list.push(region);
    groups.set(region.provinsi, list);
  }

  return Array.from(groups.entries())
    .map(([provinsi, list]) => {
      const timbulan = list.reduce(
        (sum, region) => sum + region.timbulanTahunan,
        0,
      );
      const terkelola = list.reduce(
        (sum, region) => sum + region.terkelolaTon,
        0,
      );
      const tidakTerkelola = list.reduce(
        (sum, region) => sum + region.tidakTerkelolaTon,
        0,
      );
      const penduduk = list.reduce(
        (sum, region) => sum + region.penduduk,
        0,
      );

      return {
        provinsi,
        nWilayah: list.length,
        timbulan,
        terkelola,
        tidakTerkelola,
        pctTerkelola: ratio(terkelola, timbulan),
        pctTidakTerkelola: ratio(tidakTerkelola, timbulan),
        penduduk,
        perKapita:
          penduduk > 0 ? (timbulan * 1000) / (penduduk * 365) : 0,
      };
    })
    .sort((a, b) => b.timbulan - a.timbulan);
}

export function aggregateProfiles(regions: Region[]): ClusterProfile[] {
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

export function rankRegions(
  regions: Region[],
  metric: RegionMetric,
  limit = 10,
  direction: "desc" | "asc" = "desc",
): Region[] {
  const sorted = [...regions].sort((a, b) => {
    const left = Number(a[metric]);
    const right = Number(b[metric]);
    return direction === "desc" ? right - left : left - right;
  });
  return sorted.slice(0, limit);
}

export function clusterCounts(
  regions: Region[],
): { cluster: ClusterId; label: string; count: number; color: string }[] {
  return CLUSTER_META.map((meta) => ({
    cluster: meta.id,
    label: meta.label,
    count: regions.filter((region) => region.cluster === meta.id).length,
    color: meta.color,
  }));
}

export function compositionAverage(
  compositions: CompositionRow[],
  regions: Region[],
): CompositionAverage[] {
  const regionMap = new Map(
    regions.map((region) => [
      `${region.provinsi}|||${region.kabKota}`,
      region,
    ]),
  );

  const weighted = {} as Record<CompositionKey, number>;
  for (const key of COMPOSITION_KEYS) weighted[key] = 0;
  let totalWeight = 0;

  for (const row of compositions) {
    const region = regionMap.get(
      `${row.provinsi}|||${row.kabKota}`,
    );
    const weight = region?.timbulanHarian || 1;
    totalWeight += weight;
    for (const key of COMPOSITION_KEYS) {
      weighted[key] += row.values[key] * weight;
    }
  }

  return COMPOSITION_KEYS.map((key) => ({
    key,
    label: COMPOSITION_LABELS[key],
    value: totalWeight > 0 ? weighted[key] / totalWeight : 0,
    color: COMPOSITION_COLORS[key],
  }));
}

export function sourceAverage(sources: SourceRow[]): SourceAverage[] {
  const totals = {} as Record<SourceKey, number>;
  for (const key of SOURCE_KEYS) totals[key] = 0;

  for (const row of sources) {
    for (const key of SOURCE_KEYS) {
      totals[key] += row.values[key];
    }
  }

  const grandTotal = SOURCE_KEYS.reduce(
    (sum, key) => sum + totals[key],
    0,
  );

  return SOURCE_KEYS.map((key) => ({
    key,
    label: SOURCE_LABELS[key],
    ton: totals[key],
    value: grandTotal > 0 ? (totals[key] / grandTotal) * 100 : 0,
    color: SOURCE_COLORS[key],
  }));
}

export interface ProvinceComposition {
  provinsi: string;
  values: Record<CompositionKey, number>;
}

export function compositionByProvince(
  compositions: CompositionRow[],
  regions: Region[],
  limit = 8,
): ProvinceComposition[] {
  const regionMap = new Map(
    regions.map((region) => [
      `${region.provinsi}|||${region.kabKota}`,
      region,
    ]),
  );

  const groups = new Map<
    string,
    { values: Record<CompositionKey, number>; weight: number }
  >();

  for (const row of compositions) {
    const group =
      groups.get(row.provinsi) ??
      ({
        values: Object.fromEntries(
          COMPOSITION_KEYS.map((key) => [key, 0]),
        ) as Record<CompositionKey, number>,
        weight: 0,
      } satisfies { values: Record<CompositionKey, number>; weight: number });

    const region = regionMap.get(
      `${row.provinsi}|||${row.kabKota}`,
    );
    const weight = region?.timbulanHarian || 1;
    group.weight += weight;
    for (const key of COMPOSITION_KEYS) {
      group.values[key] += row.values[key] * weight;
    }
    groups.set(row.provinsi, group);
  }

  return Array.from(groups.entries())
    .map(([provinsi, group]) => {
      const values = {} as Record<CompositionKey, number>;
      for (const key of COMPOSITION_KEYS) {
        values[key] =
          group.weight > 0 ? group.values[key] / group.weight : 0;
      }
      return { provinsi, values };
    })
    .sort((a, b) => {
      const totalA = COMPOSITION_KEYS.reduce(
        (sum, key) => sum + a.values[key],
        0,
      );
      const totalB = COMPOSITION_KEYS.reduce(
        (sum, key) => sum + b.values[key],
        0,
      );
      return totalB - totalA;
    })
    .slice(0, limit);
}

export interface ProvinceSource {
  provinsi: string;
  values: Record<SourceKey, number>;
  total: number;
}

export function sourceByProvince(
  sources: SourceRow[],
  limit = 8,
): ProvinceSource[] {
  const groups = new Map<string, Record<SourceKey, number>>();

  for (const row of sources) {
    const group =
      groups.get(row.provinsi) ??
      (Object.fromEntries(
        SOURCE_KEYS.map((key) => [key, 0]),
      ) as Record<SourceKey, number>);

    for (const key of SOURCE_KEYS) {
      group[key] += row.values[key];
    }
    groups.set(row.provinsi, group);
  }

  return Array.from(groups.entries())
    .map(([provinsi, totals]) => {
      const total = SOURCE_KEYS.reduce(
        (sum, key) => sum + totals[key],
        0,
      );
      const values = {} as Record<SourceKey, number>;
      for (const key of SOURCE_KEYS) {
        values[key] = total > 0 ? (totals[key] / total) * 100 : 0;
      }
      return { provinsi, values, total };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export function dominantComposition(
  compositions: CompositionRow[],
): { key: CompositionKey; label: string; count: number; color: string }[] {
  return COMPOSITION_KEYS.map((key) => ({
    key,
    label: COMPOSITION_LABELS[key],
    count: compositions.filter((row) => row.jenisDominan === key).length,
    color: COMPOSITION_COLORS[key],
  })).sort((a, b) => b.count - a.count);
}

export function dominantSource(
  sources: SourceRow[],
): { key: SourceKey; label: string; count: number; color: string }[] {
  return SOURCE_KEYS.map((key) => ({
    key,
    label: SOURCE_LABELS[key],
    count: sources.filter((row) => row.sumberDominan === key).length,
    color: SOURCE_COLORS[key],
  })).sort((a, b) => b.count - a.count);
}
