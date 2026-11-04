"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
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

  const stage = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);

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
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!page || !ghost || reduce) {
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
      clone.style.transition = "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)";
      ghost.replaceChildren(clone);
      gsap.set(ghost, { display: "block", x: 0, scale: 1, autoAlpha: 1 });
      gsap.set(page, { autoAlpha: 0 });

      // Umpan balik instan lewat CSS transition (dijalankan compositor, tidak ikut
      // membeku saat thread utama sibuk memasang halaman baru)
      void clone.offsetWidth;
      clone.style.transform = `scale(0.97) translateX(${-3 * dir}%)`;

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
      const cards = page.querySelectorAll('[data-anim="card"]');
      gsap.set([page, ghost], { willChange: "transform, opacity" });
      gsap.set(cards, { autoAlpha: 0, y: 16 });
      gsap.set(page, {
        autoAlpha: 1,
        xPercent: 104 * dir,
        backgroundColor: "#E9E6E0",
      });
      const tl = gsap.timeline();
      tl.to(page, { xPercent: 0, duration: 0.75, ease: "power3.inOut" }, 0)
        .to(
          ghost,
          { scale: 0.97, xPercent: -5 * dir, duration: 0.75, ease: "power3.inOut" },
          0,
        )
        .to(
          cards,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
            ease: "power2.out",
            stagger: 0.03,
            clearProps: "transform,opacity,visibility",
          },
          0.12,
        );
      await finished(tl);

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
        <div className="flex h-dvh gap-3 overflow-hidden bg-canvas bg-grid p-3">
          <Rail />
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <Topbar />
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-[28px]">
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
            </div>
          </div>
        </div>
        <Intro onDone={() => (ready.current = true)} />
      </SectionNavContext.Provider>
    </DashboardProvider>
  );
}
