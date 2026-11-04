"use client";

import {
  ResponsiveContainer as RechartsContainer,
  type ResponsiveContainerProps,
} from "recharts";

/**
 * ResponsiveContainer dengan debounce: saat kontainer berubah ukuran terus-menerus
 * (animasi lebar sidebar), grafik tidak digambar ulang tiap frame, hanya setelah
 * ukurannya berhenti berubah.
 */
export function ResponsiveContainer(props: ResponsiveContainerProps) {
  return <RechartsContainer debounce={160} {...props} />;
}
