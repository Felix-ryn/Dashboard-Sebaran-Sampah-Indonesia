import type { CSSProperties } from "react";

export const tooltipContentStyle: CSSProperties = {
  borderRadius: 14,
  border: "1px solid #E2E8F0",
  boxShadow: "0 14px 34px rgba(15, 23, 42, 0.14)",
  fontSize: 13,
  padding: "12px 14px",
  backgroundColor: "#FFFFFF",
  color: "#0F172A",
};

export const tooltipLabelStyle: CSSProperties = {
  color: "#0F172A",
  fontWeight: 600,
  marginBottom: 6,
  fontSize: 13,
};

export const tooltipItemStyle: CSSProperties = {
  color: "#475569",
  fontSize: 13,
  paddingTop: 3,
  paddingBottom: 3,
};

export const axisTick = { fill: "#64748B", fontSize: 12 };

export const cartesianGrid = {
  stroke: "#E2E8F0",
  strokeDasharray: "3 3",
};

export const legendStyle: CSSProperties = {
  fontSize: 13,
  color: "#475569",
  paddingTop: 12,
};
