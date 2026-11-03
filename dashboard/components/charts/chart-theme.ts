import type { CSSProperties } from "react";

export const tooltipContentStyle: CSSProperties = {
  borderRadius: 12,
  border: "1px solid #E2E8F0",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
  fontSize: 12,
  padding: "10px 12px",
  backgroundColor: "#FFFFFF",
  color: "#0F172A",
};

export const tooltipLabelStyle: CSSProperties = {
  color: "#0F172A",
  fontWeight: 600,
  marginBottom: 4,
};

export const tooltipItemStyle: CSSProperties = {
  color: "#475569",
  fontSize: 12,
  paddingTop: 2,
  paddingBottom: 2,
};

export const axisTick = { fill: "#64748B", fontSize: 11 };

export const cartesianGrid = {
  stroke: "#E2E8F0",
  strokeDasharray: "3 3",
};

export const legendStyle: CSSProperties = {
  fontSize: 11,
  color: "#475569",
  paddingTop: 8,
};
