"use client";

import { useState } from "react";

/** Melacak batang yang sedang disorot agar batang lain bisa diredupkan. */
export function useHover() {
  const [index, setIndex] = useState<number | null>(null);
  return {
    index,
    handlers: {
      onMouseEnter: (_: unknown, i: number) => setIndex(i),
      onMouseLeave: () => setIndex(null),
    },
    dim: (i: number) => (index === null || index === i ? 1 : 0.4),
  };
}
