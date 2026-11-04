"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowUpRight, MessageCircle, SendHorizontal, X } from "lucide-react";
import gsap from "gsap";
import { cn } from "@/lib/cn";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { useSectionNav } from "@/components/layout/section-nav";
import type { ChatAction, ChatMessage, ChatReply } from "@/lib/chat/types";

/** Label harus sama dengan id di lib/chat/quick.ts (dijawab server tanpa AI). */
const QUICK_CHIPS = [
  { id: "persen", label: "Berapa persen sampah yang terkelola?" },
  { id: "wilayah-terbesar", label: "5 wilayah dengan sampah tak terkelola terbesar" },
  { id: "provinsi", label: "Provinsi mana yang paling banyak sampah tak terkelola?" },
  { id: "klaster", label: "Jelaskan empat klaster wilayah" },
  { id: "per-kapita", label: "Wilayah dengan sampah per orang tertinggi" },
];

interface Bubble extends ChatMessage {
  id: number;
  actions?: ChatAction[];
  source?: ChatReply["source"];
}

/** Penyajian markdown sederhana: **tebal**, daftar bernomor/butir, baris baru. */
function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part.replace(/\*([^*]+)\*/g, "$1")}</span>
    ),
  );
}

function RichText({ text }: { text: string }) {
  return (
    <div className="space-y-1.5">
      {text.split("\n").map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        const list = line.match(/^(\d+\.|-|\*)\s+(.*)$/);
        if (list) {
          const marker = /\d/.test(list[1]) ? list[1] : "•";
          return (
            <p key={i} className="flex gap-2">
              <span className="w-4 shrink-0 text-right text-slate-400">{marker}</span>
              <span>{renderInline(list[2])}</span>
            </p>
          );
        }
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

export function ChatPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { setSearch, setProvinsi, setCluster, resetFilters } = useDashboard();
  const { go } = useSectionNav();
  const panel = useRef<HTMLElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);
  const first = useRef(true);

  const [messages, setMessages] = useState<Bubble[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  // Buka/tutup: meluncur dari kanan (transform saja, ringan)
  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (open) {
      gsap.set(el, { visibility: "visible" });
      gsap.fromTo(
        el,
        { xPercent: reduce ? 0 : 108, autoAlpha: reduce ? 0 : 1 },
        { xPercent: 0, autoAlpha: 1, duration: reduce ? 0.01 : 0.55, ease: "power3.out" },
      );
      window.setTimeout(() => input.current?.focus({ preventScroll: true }), 350);
    } else if (!first.current) {
      gsap.to(el, {
        xPercent: reduce ? 0 : 108,
        autoAlpha: reduce ? 0 : 1,
        duration: reduce ? 0.01 : 0.4,
        ease: "power3.inOut",
        onComplete: () => {
          gsap.set(el, { visibility: "hidden" });
        },
      });
    }
    first.current = false;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const push = (bubble: Omit<Bubble, "id">) =>
    setMessages((prev) => [...prev, { ...bubble, id: nextId.current++ }]);

  async function ask(body: object, userText: string) {
    if (loading) return;
    push({ role: "user", content: userText });
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json()) as ChatReply;
      push({ role: "assistant", content: data.reply, actions: data.actions, source: data.source });
    } catch {
      push({
        role: "assistant",
        content: "Koneksi bermasalah. Coba lagi, atau pilih salah satu pertanyaan contoh.",
        source: "cepat",
      });
    } finally {
      setLoading(false);
    }
  }

  const sendQuick = (id: string, label: string) => ask({ quick: id }, label);

  const sendText = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || loading) return;
    setDraft("");
    const history = [...messages.map(({ role, content }) => ({ role, content })), { role: "user", content: text }];
    ask({ messages: history.slice(-10) }, text);
  };

  const runAction = (action: ChatAction) => {
    resetFilters();
    if (action.search) setSearch(action.search);
    if (action.provinsi) setProvinsi(action.provinsi);
    if (action.cluster !== undefined) setCluster(action.cluster);
    if (action.href) go(action.href);
  };

  return (
    <aside
      ref={panel}
      aria-label="Tanya data"
      aria-hidden={!open}
      inert={!open}
      style={{ visibility: "hidden" }}
      className="absolute inset-y-0 right-0 z-30 flex w-full flex-col rounded-[28px] bg-white p-4 shadow-[0_0_48px_rgba(22,24,29,0.16)] sm:w-[400px]"
    >
      <header className="flex shrink-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F6C21B] text-[#16181D]">
            <MessageCircle className="h-[18px] w-[18px]" strokeWidth={2.25} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-semibold leading-5 text-[#16181D]">Tanya Data</h2>
            <p className="truncate text-xs leading-4 text-slate-500">Jawaban dari data SIPSN 2025</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup chat"
          title="Tutup (Esc)"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3F0EA] text-slate-600 transition hover:scale-105 hover:bg-[#16181D] hover:text-[#F6C21B] active:scale-95"
        >
          <X className="h-4 w-4" strokeWidth={2.25} />
        </button>
      </header>

      <div ref={list} className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="space-y-3">
            <div className="rounded-2xl bg-[#F8F6F2] p-3.5 text-[13px] leading-5 text-slate-700">
              Halo! Tanyakan apa saja tentang data pengelolaan sampah 327 kabupaten/kota.
              Jawaban dihitung dari data asli, dan saya akan bilang terus terang bila datanya tidak ada.
            </div>
            <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Coba tanyakan
            </p>
            <div className="flex flex-col gap-2">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  disabled={loading}
                  onClick={() => sendQuick(chip.id, chip.label)}
                  className="rounded-2xl border border-slate-200 px-3.5 py-2.5 text-left text-[13px] leading-5 text-slate-700 transition hover:-translate-y-0.5 hover:border-[#16181D] hover:bg-[#F8F6F2] active:scale-[0.99] disabled:opacity-50"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((message) =>
          message.role === "user" ? (
            <div key={message.id} className="tip-pop flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-br-md bg-[#16181D] px-3.5 py-2.5 text-[13px] leading-5 text-white">
                {message.content}
              </p>
            </div>
          ) : (
            <div key={message.id} className="tip-pop flex flex-col items-start gap-2">
              <div className="max-w-[92%] rounded-2xl rounded-bl-md bg-[#F3F0EA] px-3.5 py-2.5 text-[13px] leading-5 text-slate-800">
                <RichText text={message.content} />
              </div>
              {message.actions && message.actions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {message.actions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => runAction(action)}
                      className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#16181D] ring-1 ring-slate-200 transition hover:bg-[#16181D] hover:text-[#F6C21B] hover:ring-[#16181D]"
                    >
                      {action.label}
                      <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} />
                    </button>
                  ))}
                </div>
              ) : null}
              {message.source ? (
                <p className="px-1 text-[10px] text-slate-400">
                  {message.source === "cepat" ? "Dihitung langsung dari data" : "Dijawab AI dari data dashboard"}
                </p>
              ) : null}
            </div>
          ),
        )}

        {loading ? (
          <div className="tip-pop flex items-center gap-1.5 px-1" aria-label="Sedang menjawab">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 animate-bounce rounded-full bg-slate-300"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        ) : null}
      </div>

      {messages.length > 0 ? (
        <div className="mt-2 flex shrink-0 gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {QUICK_CHIPS.slice(0, 3).map((chip) => (
            <button
              key={chip.id}
              type="button"
              disabled={loading}
              onClick={() => sendQuick(chip.id, chip.label)}
              className="shrink-0 whitespace-nowrap rounded-full bg-[#F3F0EA] px-3 py-1.5 text-[11px] font-medium text-slate-600 transition hover:bg-[#E9E4DB] disabled:opacity-50"
            >
              {chip.label.length > 34 ? `${chip.label.slice(0, 32)}…` : chip.label}
            </button>
          ))}
        </div>
      ) : null}

      <form onSubmit={sendText} className="mt-2 flex shrink-0 items-center gap-2">
        <label htmlFor="chat-input" className="sr-only">
          Pertanyaan tentang data sampah
        </label>
        <input
          id="chat-input"
          ref={input}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={500}
          placeholder="Tanya tentang data sampah..."
          autoComplete="off"
          className="h-11 min-w-0 flex-1 rounded-full bg-[#F3F0EA] px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[#F6C21B]/70"
        />
        <button
          type="submit"
          disabled={loading || !draft.trim()}
          aria-label="Kirim"
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#16181D] text-[#F6C21B] transition hover:scale-105 active:scale-95",
            "disabled:scale-100 disabled:opacity-40",
          )}
        >
          <SendHorizontal className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </button>
      </form>
    </aside>
  );
}
