"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CLUSTER_META } from "@/lib/constants";
import {
  aggregateNational,
  aggregateProfiles,
  aggregateProvinces,
  clusterCounts,
  compositionAverage,
  compositionByProvince,
  dominantComposition,
  dominantSource,
  sourceAverage,
  sourceByProvince,
  type RegionMetric,
} from "@/lib/metrics";
import type {
  ClusterId,
  CompositionAverage,
  DashboardData,
  NationalAggregate,
  ProvinceAggregate,
  Region,
  SourceAverage,
} from "@/lib/types";

export interface DashboardFilters {
  provinsi: string;
  cluster: ClusterId | "all";
  search: string;
}

interface DashboardContextValue {
  data: DashboardData;
  filters: DashboardFilters;
  setProvinsi: (value: string) => void;
  setCluster: (value: ClusterId | "all") => void;
  setSearch: (value: string) => void;
  resetFilters: () => void;
  activeFilterCount: number;
  filteredRegions: Region[];
  filteredCompositions: DashboardData["compositions"];
  filteredSources: DashboardData["sources"];
  excludedSourceCount: number;
  national: NationalAggregate;
  provinces: ProvinceAggregate[];
  profiles: ReturnType<typeof aggregateProfiles>;
  clusterSummary: ReturnType<typeof clusterCounts>;
  compositionAvg: CompositionAverage[];
  sourceAvg: SourceAverage[];
  compositionProvinces: ReturnType<typeof compositionByProvince>;
  sourceProvinces: ReturnType<typeof sourceByProvince>;
  dominantComps: ReturnType<typeof dominantComposition>;
  dominantSources: ReturnType<typeof dominantSource>;
  provincesList: string[];
  rank: (metric: RegionMetric, limit?: number) => Region[];
}

const DEFAULT_FILTERS: DashboardFilters = {
  provinsi: "all",
  cluster: "all",
  search: "",
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({
  data,
  children,
}: {
  data: DashboardData;
  children: ReactNode;
}) {
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);

  const setProvinsi = (value: string) =>
    setFilters((current) => ({ ...current, provinsi: value }));
  const setCluster = (value: ClusterId | "all") =>
    setFilters((current) => ({ ...current, cluster: value }));
  const setSearch = (value: string) =>
    setFilters((current) => ({ ...current, search: value }));
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const filteredRegions = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return data.regions.filter((region) => {
      if (
        filters.provinsi !== "all" &&
        region.provinsi !== filters.provinsi
      ) {
        return false;
      }
      if (filters.cluster !== "all" && region.cluster !== filters.cluster) {
        return false;
      }
      if (
        query &&
        !`${region.kabKota} ${region.provinsi}`
          .toLowerCase()
          .includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [data.regions, filters]);

  const filteredKeys = useMemo(
    () =>
      new Set(
        filteredRegions.map(
          (region) => `${region.provinsi}|||${region.kabKota}`,
        ),
      ),
    [filteredRegions],
  );

  const filteredCompositions = useMemo(
    () =>
      data.compositions.filter((row) =>
        filteredKeys.has(`${row.provinsi}|||${row.kabKota}`),
      ),
    [data.compositions, filteredKeys],
  );

  const sourcesMatchingFilters = useMemo(
    () =>
      data.sources.filter((row) =>
        filteredKeys.has(`${row.provinsi}|||${row.kabKota}`),
      ),
    [data.sources, filteredKeys],
  );

  const filteredSources = useMemo(
    () => sourcesMatchingFilters.filter((row) => !row.isAnomaly),
    [sourcesMatchingFilters],
  );

  const excludedSourceCount =
    sourcesMatchingFilters.length - filteredSources.length;

  const national = useMemo(
    () => aggregateNational(filteredRegions),
    [filteredRegions],
  );
  const provinces = useMemo(
    () => aggregateProvinces(filteredRegions),
    [filteredRegions],
  );
  const profiles = useMemo(
    () => aggregateProfiles(filteredRegions),
    [filteredRegions],
  );
  const clusterSummary = useMemo(
    () => clusterCounts(filteredRegions),
    [filteredRegions],
  );
  const compositionAvg = useMemo(
    () => compositionAverage(filteredCompositions, filteredRegions),
    [filteredCompositions, filteredRegions],
  );
  const sourceAvg = useMemo(
    () => sourceAverage(filteredSources),
    [filteredSources],
  );
  const compositionProvinces = useMemo(
    () => compositionByProvince(filteredCompositions, filteredRegions, 8),
    [filteredCompositions, filteredRegions],
  );
  const sourceProvinces = useMemo(
    () => sourceByProvince(filteredSources, 8),
    [filteredSources],
  );
  const dominantComps = useMemo(
    () => dominantComposition(filteredCompositions),
    [filteredCompositions],
  );
  const dominantSources = useMemo(
    () => dominantSource(filteredSources),
    [filteredSources],
  );

  const provincesList = useMemo(
    () =>
      Array.from(new Set(data.regions.map((region) => region.provinsi))).sort(
        (a, b) => a.localeCompare(b, "id"),
      ),
    [data.regions],
  );

  const rank = (metric: RegionMetric, limit = 10) => {
    const sorted = [...filteredRegions].sort(
      (a, b) => Number(b[metric]) - Number(a[metric]),
    );
    return sorted.slice(0, limit);
  };

  const activeFilterCount =
    (filters.provinsi !== "all" ? 1 : 0) +
    (filters.cluster !== "all" ? 1 : 0) +
    (filters.search.trim() ? 1 : 0);

  const value: DashboardContextValue = {
    data,
    filters,
    setProvinsi,
    setCluster,
    setSearch,
    resetFilters,
    activeFilterCount,
    filteredRegions,
    filteredCompositions,
    filteredSources,
    excludedSourceCount,
    national,
    provinces,
    profiles,
    clusterSummary,
    compositionAvg,
    sourceAvg,
    compositionProvinces,
    sourceProvinces,
    dominantComps,
    dominantSources,
    provincesList,
    rank,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard harus dipakai di dalam DashboardProvider");
  }
  return context;
}

export const CLUSTER_FILTERS = CLUSTER_META;
