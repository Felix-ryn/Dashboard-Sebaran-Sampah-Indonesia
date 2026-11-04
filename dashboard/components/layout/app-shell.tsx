"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { ChatLauncher } from "@/components/chat/chat-launcher";
import { ChatPanel } from "@/components/chat/chat-panel";
import { DashboardProvider } from "@/components/providers/dashboard-provider";
import { Intro } from "@/components/layout/intro";
import { Rail } from "@/components/layout/rail";
import { SectionNavContext } from "@/components/layout/section-nav";
import { Topbar } from "@/components/layout/topbar";
import { NAV_ITEMS } from "@/lib/constants";
import type { DashboardData } from "@/lib/types";

const nextFrame = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );

const finished = (tl: gsap.core.Tween | gsap.core.Timeline) =>
  new Promise<void>((resolve) => tl.eventCallback("onComplete", () => resolve()));

/**
 * Transisi antar-section: snapshot halaman lama menjadi lapisan belakang yang
 * mengecil dan meredup, halaman baru meluncur menimpanya. Hanya transform dan
 * opacity (compositor), jadi tetap 60 fps.
 */
export function AppShell({
  data,
  children,
}: {
  data: DashboardData;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [chatOpen, setChatOpen] = useState(false);
  const closeChat = useCallback(() => setChatOpen(false), []);

  const stage = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const edge = useRef<HTMLDivElement>(null);

  const ready = useRef(false);
  const busy = useRef(false);
  const currentPath = useRef(pathname);
  const waiter = useRef<{ href: string; resolve: () => void } | null>(null);

  // Menyelesaikan penantian saat rute tujuan sudah dirender
  useEffect(() => {
    currentPath.current = pathname;
    if (waiter.current && waiter.current.href === pathname) {
      waiter.current.resolve();
      waiter.current = null;
      return;
    }
    // Navigasi di luar panel (tombol back/forward): animasi kartu saja
    if (ready.current && !busy.current && stage.current) {
      const cards = stage.current.querySelectorAll('[data-anim="card"]');
      gsap.fromTo(
        cards,
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.03, ease: "power2.out", clearProps: "transform,opacity,visibility" },
      );
    }
  }, [pathname]);

  const go = useCallback(
    async (href: string) => {
      if (busy.current || href === currentPath.current) return;
      const page = stage.current;
      const ghost = panel.current;
      const rim = edge.current;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!page || !ghost || !rim || reduce) {
        router.push(href);
        return;
      }

      busy.current = true;

      // Arah geser mengikuti urutan menu: maju = dari kanan, mundur = dari kiri
      const order = NAV_ITEMS.map((item) => item.href);
      const dir = order.indexOf(href) >= order.indexOf(currentPath.current) ? 1 : -1;

      // 1. Snapshot halaman lama jadi lapisan belakang; halaman asli disembunyikan
      //    selama rute berganti (tampilan tetap sama, tanpa kedipan)
      const clone = page.cloneNode(true) as HTMLElement;
      clone.style.transformOrigin = "center";
      clone.style.transition =
        "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease-out";
      ghost.replaceChildren(clone);
      gsap.set(ghost, { display: "block", x: 0, scale: 1, autoAlpha: 1 });
      gsap.set(page, { autoAlpha: 0 });

      // Umpan balik instan lewat CSS transition (dijalankan compositor, tidak ikut
      // membeku saat thread utama sibuk memasang halaman baru)
      void clone.offsetWidth;
      // Halaman lama hanya mengecil dan meredup di tempat (tanpa bergeser), sehingga
      // tepi kotaknya tidak pernah terlihat memotong isi di sisi kiri/kanan
      clone.style.transform = "scale(0.975)";
      clone.style.opacity = "0.85";

      const arrived = new Promise<void>((resolve) => {
        waiter.current = { href, resolve };
        window.setTimeout(resolve, 7000);
      });
      router.push(href);
      await arrived;
      // Beri waktu grafik (Recharts) menghitung ukuran saat masih tersembunyi,
      // supaya layout berat tidak terjadi di tengah animasi
      await nextFrame();
      await new Promise<void>((resolve) => window.setTimeout(resolve, 40));
      await nextFrame();

      // 2. Halaman baru meluncur menimpa, halaman lama mundur ke belakang
      // Lapisan meluncur utuh (semua kartu sudah terlihat, tidak ada fade per kartu).
      // Tepinya diberi bayangan tipis yang ikut bergerak agar batas lapisan terlihat.
      const travel = page.offsetWidth * 1.04 * dir;
      const rimW = 56;
      const rimAlpha = document.documentElement.classList.contains("dark") ? 0.5 : 0.12;
      gsap.set([page, ghost, rim], { willChange: "transform" });
      gsap.set(page, { autoAlpha: 1, x: travel, backgroundColor: "var(--sheet-bg)" });
      gsap.set(rim, {
        display: "block",
        autoAlpha: 1,
        left: dir === 1 ? -rimW : "100%",
        background:
          dir === 1
            ? `linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,${rimAlpha}))`
            : `linear-gradient(to left, rgba(0,0,0,0), rgba(0,0,0,${rimAlpha}))`,
      });
      const ease = "power3.inOut";
      clone.style.opacity = "0.5";
      const tl = gsap.timeline();
      tl.fromTo(rim, { x: travel }, { x: 0, duration: 0.75, ease }, 0)
        .to(page, { x: 0, duration: 0.75, ease }, 0)
        .to(ghost, { scale: 0.985, duration: 0.75, ease }, 0)
        .to(rim, { autoAlpha: 0, duration: 0.25, ease: "power1.in" }, 0.5);
      await finished(tl);

      gsap.set(rim, { display: "none", clearProps: "willChange,left,background" });
      gsap.set(page, { clearProps: "transform,backgroundColor,willChange" });
      gsap.set(ghost, { display: "none", clearProps: "willChange" });
      ghost.replaceChildren();
      busy.current = false;
    },
    [router],
  );

  return (
    <DashboardProvider data={data}>
      <SectionNavContext.Provider value={{ go }}>
        <div className="flex h-dvh gap-3 overflow-hidden bg-canvas p-3">
          <Rail chatOpen={chatOpen} onChat={() => setChatOpen((value) => !value)} />
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <Topbar />
            {/* Permukaan utuh: kartu duduk di dalam satu panel, bukan melayang di atas kanvas */}
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-[32px] bg-[#EAECF0] ring-1 ring-black/[0.05]">
              <div className="absolute inset-2.5">
                <main
                  ref={stage}
                  className="relative z-20 h-full overflow-y-auto overflow-x-hidden lg:overflow-hidden"
                >
                  {children}
                </main>

                <div
                  ref={panel}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-10 hidden overflow-hidden will-change-transform"
                />
                <div
                  ref={edge}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 z-[15] hidden w-14"
                />
              </div>

              <ChatLauncher open={chatOpen} onOpen={() => setChatOpen(true)} />
              <ChatPanel open={chatOpen} onClose={closeChat} />
            </div>
          </div>
        </div>
        <Intro onDone={() => (ready.current = true)} />
      </SectionNavContext.Provider>
    </DashboardProvider>
  );
}
