"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/cn";

const SEEN_KEY = "chat-teaser-seen";

/**
 * Tombol gelembung chat yang melayang di pojok kanan bawah. Muncul setelah intro
 * selesai, dengan gelembung ajakan singkat (sekali per sesi) supaya pengunjung
 * langsung tahu bahwa ini chatbot.
 */
export function ChatLauncher({ open, onOpen }: { open: boolean; onOpen: () => void }) {
  const [teaser, setTeaser] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    if (seen) return;
    const show = window.setTimeout(() => setTeaser(true), 6000);
    const hide = window.setTimeout(() => setTeaser(false), 15000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);

  const dismiss = () => {
    setTeaser(false);
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}
  };

  const visible = !open;

  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-6 right-6 z-[25] hidden flex-col items-end gap-3 transition-all duration-300 ease-out md:flex",
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
      )}
    >
      {teaser && visible ? (
        <div className="fab-teaser pointer-events-auto relative max-w-[230px] rounded-2xl rounded-br-md bg-[#16181D] py-3 pl-4 pr-9 text-[13px] leading-5 text-white shadow-[0_14px_34px_rgba(15,23,42,0.28)]">
          <p className="font-semibold">Ada yang ingin ditanyakan?</p>
          <p className="text-slate-300">Tanya data sampah langsung ke chatbot.</p>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Tutup ajakan"
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          dismiss();
          onOpen();
        }}
        tabIndex={visible ? 0 : -1}
        aria-label="Buka chatbot Tanya Data"
        title="Chatbot Tanya Data"
        className="fab-in group pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-[#F6C21B] text-[#16181D] shadow-[0_10px_28px_rgba(22,24,29,0.28)] transition-transform duration-200 hover:scale-110 active:scale-95"
      >
        <span className="fab-ring pointer-events-none absolute inset-0 rounded-full bg-[#F6C21B]" />
        <MessageCircle className="relative h-6 w-6 transition-transform duration-200 group-hover:-rotate-6" strokeWidth={2.25} />
      </button>
    </div>
  );
}
