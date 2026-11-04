"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

interface TipState {
  content: ReactNode;
}

/**
 * Tooltip ringan untuk grafik berbasis HTML (BarList, HeatTable, dst.).
 * Posisi diperbarui langsung ke elemen (tanpa render ulang) agar mengikuti
 * kursor dengan mulus; React hanya merender ulang saat isi tooltip berganti.
 */
export function useHoverTip() {
  const [tip, setTip] = useState<TipState | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });

  const place = useCallback(() => {
    const el = box.current;
    if (!el) return;
    const { x, y } = pos.current;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const left = x + 16 + w > window.innerWidth - 8 ? x - w - 16 : x + 16;
    const top = y + 16 + h > window.innerHeight - 8 ? y - h - 16 : y + 16;
    el.style.transform = `translate3d(${Math.max(8, left)}px, ${Math.max(8, top)}px, 0)`;
  }, []);

  // Klik, gulir, atau pindah tab menutup tooltip (elemen pemicunya bisa hilang tanpa pointerleave)
  const visible = tip !== null;
  useEffect(() => {
    if (!visible) return;
    const hide = () => setTip(null);
    document.addEventListener("pointerdown", hide, true);
    window.addEventListener("blur", hide);
    window.addEventListener("scroll", hide, true);
    return () => {
      document.removeEventListener("pointerdown", hide, true);
      window.removeEventListener("blur", hide);
      window.removeEventListener("scroll", hide, true);
    };
  }, [visible]);

  const bind = useCallback(
    (content: ReactNode) => ({
      onPointerEnter: (event: PointerEvent) => {
        pos.current = { x: event.clientX, y: event.clientY };
        setTip({ content });
      },
      onPointerMove: (event: PointerEvent) => {
        pos.current = { x: event.clientX, y: event.clientY };
        place();
      },
      onPointerLeave: () => setTip(null),
    }),
    [place],
  );

  const node =
    tip && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={(el) => {
              box.current = el;
              if (el) place();
            }}
            role="tooltip"
            className="tip-pop pointer-events-none fixed left-0 top-0 z-[200] max-w-[280px] rounded-2xl bg-[#16181D] px-3.5 py-2.5 text-xs leading-5 text-white shadow-[0_14px_34px_rgba(15,23,42,0.28)]"
          >
            {tip.content}
          </div>,
          document.body,
        )
      : null;

  return { bind, node };
}

/** Isi tooltip standar: judul tebal, baris label-nilai, catatan kecil. */
export function TipBody({
  title,
  swatch,
  rows,
  note,
}: {
  title: string;
  swatch?: string;
  rows?: { label: string; value: string }[];
  note?: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="flex items-center gap-2 text-[13px] font-semibold">
        {swatch ? (
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: swatch }}
          />
        ) : null}
        {title}
      </p>
      {rows?.map((row) => (
        <p key={row.label} className="flex items-baseline justify-between gap-5">
          <span className="text-slate-300">{row.label}</span>
          <span className="font-semibold tabular-nums">{row.value}</span>
        </p>
      ))}
      {note ? <p className="border-t border-white/15 pt-1.5 text-slate-300">{note}</p> : null}
    </div>
  );
}
