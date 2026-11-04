"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { LogoMark } from "@/components/brand/logo";

gsap.registerPlugin(useGSAP);

/** Intro hanya diputar sekali per pemuatan halaman penuh. */
let introPlayed = false;

/** Animasi masuk seluruh dashboard (dipanggil saat intro berpindah ke dashboard). */
function enterDashboard() {
  gsap.fromTo(
    ".enter-rail",
    { autoAlpha: 0, x: -24 },
    { autoAlpha: 1, x: 0, duration: 0.8, ease: "power3.out", stagger: 0.08 },
  );
  gsap.fromTo(
    ".enter-top",
    { autoAlpha: 0, y: -20 },
    { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.06, delay: 0.1 },
  );
  gsap.fromTo(
    '[data-anim="card"]',
    { autoAlpha: 0, y: 24 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.6,
      ease: "power3.out",
      stagger: { each: 0.05, from: "start" },
      delay: 0.15,
      clearProps: "transform,opacity,visibility",
    },
  );
}

export function Intro({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const logoWrap = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(introPlayed);

  useGSAP(
    () => {
      if (introPlayed) {
        onDone();
        return;
      }

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const dock = document.getElementById("rail-logo");

      if (reduce) {
        introPlayed = true;
        setGone(true);
        onDone();
        return;
      }

      // Sembunyikan dashboard di balik intro; logo rail muncul saat logo "mendarat".
      gsap.set([".enter-rail", ".enter-top", '[data-anim="card"]'], { autoAlpha: 0 });
      const dockMark = dock?.querySelector("svg") ?? null;
      if (dock) gsap.set(dock, { backgroundColor: "rgba(255,255,255,0)" });
      if (dockMark) gsap.set(dockMark, { opacity: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          introPlayed = true;
          setGone(true);
          onDone();
        },
      });

      // 1. Tong digambar garis demi garis
      tl.fromTo(
        ".logo-outline",
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 1.1, stagger: 0.14, ease: "power2.inOut" },
        0.15,
      )
        // 2. Tutup tong terangkat sedikit lalu menutup
        .fromTo(
          ".logo-lid",
          { y: -26, rotate: -5, transformOrigin: "50% 100%" },
          { y: 0, rotate: 0, duration: 0.7, ease: "back.out(2.2)" },
          0.95,
        )
        // 3. Empat batang grafik tumbuh berurutan
        .fromTo(
          ".logo-bar",
          { scaleY: 0, autoAlpha: 0, transformOrigin: "50% 100%" },
          { scaleY: 1, autoAlpha: 1, duration: 0.7, stagger: 0.13, ease: "back.out(1.5)" },
          1.0,
        );

      // 5. Transisi halus: logo splash mengecil tepat ke logo di rail.
      // Target diukur dari <svg> di dalam rail (bukan lingkarannya) sehingga
      // ukuran dan posisi akhirnya identik; lingkaran putih rail memudar masuk
      // selama penerbangan, jadi serah-terima di ujung tidak terlihat.
      const wrap = logoWrap.current;
      const target = dockMark?.getBoundingClientRect();
      const origin = wrap?.getBoundingClientRect();

      tl.add("exit", 2.0);
      if (wrap && target && origin && dock && dockMark) {
        const FLY = 1.5;
        tl.to(
          wrap,
          {
            x: target.left + target.width / 2 - (origin.left + origin.width / 2),
            y: target.top + target.height / 2 - (origin.top + origin.height / 2),
            scale: target.height / origin.height,
            duration: FLY,
            ease: "power2.inOut",
          },
          "exit",
        )
          .to(
            dock,
            { backgroundColor: "rgb(255,255,255)", duration: 1.0, ease: "sine.inOut" },
            `exit+=${FLY - 1.1}`,
          )
          .add(() => {
            gsap.set(dockMark, { opacity: 1 });
            gsap.set(wrap, { autoAlpha: 0 });
            gsap.set(dock, { clearProps: "backgroundColor" });
          }, `exit+=${FLY}`);
      }
      tl.set(root.current, { pointerEvents: "none" }, "exit")
        .to(".intro-bg", { autoAlpha: 0, duration: 1.0, ease: "sine.inOut" }, "exit+=0.2")
        .add(enterDashboard, "exit+=0.8")
        .to({}, { duration: 0.2 });
    },
    { scope: root },
  );

  if (gone) return null;

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-auto fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6"
    >
      <div className="intro-bg absolute inset-0 bg-[#F4F5F7]" />
      <div ref={logoWrap} className="relative h-44 w-36">
        <LogoMark className="intro-start h-full w-full" />
      </div>
    </div>
  );
}
