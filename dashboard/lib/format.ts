const numberFormatter = (digits: number) =>
  new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });

export function formatNumber(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return "-";
  return numberFormatter(digits).format(value);
}

export function formatDecimal(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "-";
  return numberFormatter(digits).format(value);
}

export function formatPct(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "-";
  return `${formatNumber(value, digits)}%`;
}

export function formatTon(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return "-";
  return `${formatNumber(value, digits)} ton`;
}

export function formatCompactTon(value: number): string {
  if (!Number.isFinite(value)) return "-";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    return `${formatDecimal(value / 1_000_000_000, 2)} miliar ton`;
  }
  if (abs >= 1_000_000) {
    return `${formatDecimal(value / 1_000_000, 2)} juta ton`;
  }
  if (abs >= 1_000) {
    return `${formatDecimal(value / 1_000, 1)} ribu ton`;
  }
  return `${formatNumber(value, 0)} ton`;
}

export function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) return "-";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    return `${formatDecimal(value / 1_000_000_000, 2)} M`;
  }
  if (abs >= 1_000_000) {
    return `${formatDecimal(value / 1_000_000, 2)} jt`;
  }
  if (abs >= 1_000) {
    return `${formatDecimal(value / 1_000, 1)} rb`;
  }
  return formatNumber(value, 0);
}

export function formatPopulation(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return `${formatNumber(value, 0)} jiwa`;
}

export function formatPerKapita(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return `${formatDecimal(value, 2)} kg/orang/hari`;
}

export function formatCoordinate(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return formatDecimal(value, 2);
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

export function ratio(numerator: number, denominator: number): number {
  if (!denominator) return 0;
  return (numerator / denominator) * 100;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
