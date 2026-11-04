"use client";

import { useState, type ReactNode } from "react";
import { DashboardProvider } from "@/components/providers/dashboard-provider";
import { FilterBar } from "@/components/layout/filter-bar";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import type { DashboardData } from "@/lib/types";

export function AppShell({
  data,
  children,
}: {
  data: DashboardData;
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DashboardProvider data={data}>
      <div className="min-h-screen bg-[#F4F7FB]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-[272px]">
          <Topbar onMenu={() => setSidebarOpen(true)} />
          <FilterBar />
          <main className="mx-auto w-full max-w-[1680px] px-4 py-7 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
          <footer className="mx-auto w-full max-w-[1680px] px-4 pb-10 text-sm leading-6 text-slate-400 sm:px-6 lg:px-8">
            Sumber: SIPSN KLHK 2025. Data disajikan untuk keperluan analisis
            dan pembelajaran, bukan dasar kebijakan resmi.
          </footer>
        </div>
      </div>
    </DashboardProvider>
  );
}
