"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { flushSync } from "react-dom";
import { Maximize2, Minimize2 } from "lucide-react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);

/** True bila kartu sedang diperbesar: grafik boleh menampilkan lebih banyak baris. */
const ExpandedContext = createContext(false);
export const ExpandedProvider = ExpandedContext.Provider;
export const useExpanded = () => useContext(ExpandedContext);

const EASE = "power3.inOut";

function stageRect(): CSSProperties {
  const stage = document.querySelector("main");
  const rect = stage?.getBoundingClientRect();
  if (!rect) return {};
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

/**
 * Memperbesar kartu hingga memenuhi area konten. Kartu berpindah lewat FLIP
 * (hanya transform, ringan), kartu lain memudar dan menyingkir ke belakang.
 * Isi kartu disembunyikan selama perpindahan lalu muncul kembali agar teks
 * tidak terdistorsi saat diskalakan.
 */
export function useExpandable() {
  const cardRef = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [rect, setRect] = useState<CSSProperties>({});
  const busy = useRef(false);

  const toggle = useCallback(() => {
    const card = cardRef.current;
    const stage = document.querySelector("main");
    if (!card || !stage || busy.current) return;

    const opening = !expanded;
    const others = Array.from(
      stage.querySelectorAll<HTMLElement>('[data-anim="card"]'),
    ).filter((el) => el !== card);
    const content = Array.from(card.children) as HTMLElement[];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const apply = () =>
      flushSync(() => {
        if (opening) setRect(stageRect());
        setExpanded(opening);
      });

    if (reduce) {
      apply();
      gsap.set(others, opening ? { autoAlpha: 0 } : { clearProps: "all" });
      return;
    }

    busy.current = true;

    const morph = () => {
      const state = Flip.getState(card);
      apply();
      gsap.set(content, { autoAlpha: 0 });
      Flip.from(state, {
        duration: 0.6,
        ease: EASE,
        scale: true,
        onComplete: () => {
          gsap.to(content, {
            autoAlpha: 1,
            duration: 0.25,
            ease: "power1.out",
            clearProps: "opacity,visibility",
          });
          busy.current = false;
        },
      });
      if (opening) {
        gsap.to(others, {
          autoAlpha: 0,
          scale: 0.94,
          duration: 0.45,
          ease: "power2.inOut",
          stagger: 0.02,
        });
      } else {
        gsap.to(others, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.03,
          delay: 0.12,
          clearProps: "transform,opacity,visibility",
        });
      }
    };

    // isi memudar dulu, baru kartu berpindah
    gsap.to(content, { autoAlpha: 0, duration: 0.14, ease: "power1.in", onComplete: morph });
  }, [expanded]);

  // Esc menutup, ukuran mengikuti jendela
  useEffect(() => {
    if (!expanded) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") toggle();
    };
    const onResize = () => setRect(stageRect());
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [expanded, toggle]);

  // Jika kartu hilang saat diperbesar (pindah halaman), kartu lain dipulihkan
  useEffect(
    () => () => {
      document
        .querySelectorAll<HTMLElement>('main [data-anim="card"]')
        .forEach((el) => {
          if (el.style.visibility === "hidden") {
            gsap.set(el, { clearProps: "transform,opacity,visibility" });
          }
        });
    },
    [],
  );

  return { cardRef, expanded, rect, toggle };
}

/** Tombol perbesar/perkecil di sudut kanan atas kartu. */
export function ExpandButton({
  expanded,
  onClick,
}: {
  expanded: boolean;
  onClick: () => void;
}) {
  const Icon = expanded ? Minimize2 : Maximize2;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={expanded ? "Perkecil grafik" : "Perbesar grafik"}
      title={expanded ? "Perkecil (Esc)" : "Perbesar"}
      className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F1F3F6] text-slate-600 transition hover:scale-105 hover:bg-[#16181D] hover:text-[#F6C21B] active:scale-95 lg:flex"
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
    </button>
  );
}

export const expandedCardClass =
  "fixed z-40 shadow-[0_28px_80px_rgba(22,24,29,0.22)]";
