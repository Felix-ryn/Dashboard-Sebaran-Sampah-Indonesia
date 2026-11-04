"use client";

import { createContext, useContext } from "react";

export interface SectionNav {
  /** Pindah section dengan animasi tirai bertumpuk. */
  go: (href: string) => void;
}

export const SectionNavContext = createContext<SectionNav>({
  go: () => undefined,
});

export function useSectionNav(): SectionNav {
  return useContext(SectionNavContext);
}
