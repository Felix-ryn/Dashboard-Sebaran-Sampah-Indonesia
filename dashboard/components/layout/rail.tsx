"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Boxes,
  ChevronsLeft,
  ChevronsRight,
  Database,
  LayoutDashboard,
  ListOrdered,
  MessageCircle,
  PieChart,
  Truck,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { APP_NAME, NAV_ITEMS, type NavIcon } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { useSectionNav } from "@/components/layout/section-nav";

export const NAV_ICONS: Record<NavIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  gap: TriangleAlert,
  cluster: Boxes,
  composition: PieChart,
  source: Truck,
  ranking: ListOrdered,
};

function RailButton({
  href,
  label,
  icon: Icon,
  active,
  open,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  open: boolean;
}) {
  const { go } = useSectionNav();

  return (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        go(href);
      }}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-11 items-center gap-3 pl-[13px] transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        open ? "w-full pr-4" : "w-11",
      )}
    >
      <span
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-300",
          active
            ? "scale-100 bg-[#16181D]"
            : "scale-90 bg-transparent group-hover:scale-100 group-hover:bg-[#F1EEE8]",
        )}
      />
      <Icon
        className={cn(
          "relative h-[18px] w-[18px] shrink-0 transition-colors",
          active ? "text-[#F6C21B]" : "text-slate-500 group-hover:text-slate-900",
        )}
        strokeWidth={2}
      />
      <span
        className={cn(
          "relative overflow-hidden whitespace-nowrap text-[13.5px] font-medium transition-opacity duration-200",
          open ? "opacity-100 delay-100" : "w-0 opacity-0",
          active ? "text-white" : "text-slate-700",
        )}
      >
        {label}
      </span>
      {!open ? (
        <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-full bg-[#16181D] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
          {label}
        </span>
      ) : null}
    </a>
  );
}

/** Tombol chatbot di sidebar: dibuat berbeda dari menu halaman (ikon kuning, label "Chatbot"). */
function ChatRailButton({
  open,
  active,
  onClick,
}: {
  open: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Buka chatbot Tanya Data"
      aria-pressed={active}
      className={cn(
        "group relative flex h-11 items-center gap-3 pl-[13px] text-left transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        open ? "w-full pr-3" : "w-11",
      )}
    >
      <span
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-300",
          active ? "scale-100 bg-[#16181D]" : "scale-100 bg-[#FDF3CF] group-hover:bg-[#F6C21B]",
        )}
      />
      <MessageCircle
        className={cn(
          "relative h-[18px] w-[18px] shrink-0 transition-colors",
          active ? "text-[#F6C21B]" : "text-[#16181D]",
        )}
        strokeWidth={2.25}
      />
      <span
        className={cn(
          "relative flex items-center gap-2 overflow-hidden whitespace-nowrap text-[13.5px] font-semibold transition-opacity duration-200",
          open ? "opacity-100 delay-100" : "w-0 opacity-0",
          active ? "text-white" : "text-[#16181D]",
        )}
      >
        Tanya Data
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
            active ? "bg-[#F6C21B] text-[#16181D]" : "bg-[#16181D] text-[#F6C21B]",
          )}
        >
          Chatbot
        </span>
      </span>
      {!open ? (
        <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-full bg-[#16181D] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
          Chatbot: Tanya Data
        </span>
      ) : null}
    </button>
  );
}

function GroupTitle({ children, open }: { children: string; open: boolean }) {
  return open ? (
    <p className="px-[13px] pb-1.5 pt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 first:pt-2">
      {children}
    </p>
  ) : (
    <div className="mx-2.5 my-2 h-px bg-slate-100 first:hidden" />
  );
}

export function Rail({
  chatOpen,
  onChat,
}: {
  chatOpen: boolean;
  onChat: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    NAV_ITEMS.forEach((item) => router.prefetch(item.href));
  }, [router]);

  const toggle = () => setOpen((value) => !value);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const Toggle = open ? ChevronsLeft : ChevronsRight;

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col gap-3 transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:flex",
        open ? "w-[224px]" : "w-[60px]",
      )}
    >
      {/* Logo: saat menu dibuka kartunya mengecil ke tinggi 0 (grid 1fr -> 0fr) dan
          gap ikut menutup, sehingga kartu menu naik mengisi seluruh tinggi. */}
      <div
        aria-hidden={open}
        className={cn(
          "grid shrink-0 transition-[grid-template-rows,margin,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "-mb-3 grid-rows-[0fr] opacity-0" : "mb-0 grid-rows-[1fr] opacity-100",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            id="rail-logo"
            className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-white p-3.5"
            title={APP_NAME}
          >
            <LogoMark className="h-full w-full" />
          </div>
        </div>
      </div>

      <nav
        aria-label="Navigasi utama"
        className="enter-rail flex min-h-0 w-full flex-1 flex-col rounded-[28px] bg-white p-2"
      >
        <div className="flex min-h-0 flex-col gap-1">
          {NAV_ITEMS.map((item, index) => (
            <div key={item.href} className="contents">
              {index === 0 ? <GroupTitle open={open}>Overview</GroupTitle> : null}
              {index === 1 ? <GroupTitle open={open}>Analisis</GroupTitle> : null}
              <RailButton
                href={item.href}
                label={item.label}
                icon={NAV_ICONS[item.icon]}
                active={isActive(item.href)}
                open={open}
              />
            </div>
          ))}
          <GroupTitle open={open}>Asisten</GroupTitle>
          <ChatRailButton open={open} active={chatOpen} onClick={onChat} />
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-3">
          {open ? (
            <div className="tip-pop flex items-center gap-3 rounded-2xl bg-[#F8F6F2] p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F6C21B] text-[#16181D]">
                <Database className="h-4 w-4" strokeWidth={2.25} />
              </span>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[13px] font-semibold text-[#16181D]">Data 2025</p>
                <p className="truncate text-[11px] text-slate-500">SIPSN KLHK · 327 wilayah</p>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={toggle}
            aria-label={open ? "Perkecil menu" : "Perbesar menu"}
            aria-expanded={open}
            className={cn(
              "group flex h-11 items-center gap-3 rounded-full bg-[#16181D] pl-[13px] text-[#F6C21B] transition-[width,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.02] active:scale-95",
              open ? "w-full pr-4" : "w-11",
            )}
          >
            <Toggle className="h-[18px] w-[18px] shrink-0" strokeWidth={2.25} />
            <span
              className={cn(
                "overflow-hidden whitespace-nowrap text-[13px] font-semibold text-white transition-opacity duration-200",
                open ? "opacity-100 delay-100" : "w-0 opacity-0",
              )}
            >
              Perkecil menu
            </span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
