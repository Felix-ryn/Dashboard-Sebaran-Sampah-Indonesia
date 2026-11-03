import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { getDashboardData } from "@/lib/data";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Beyond the Trash | Dashboard Sampah 2025",
    template: "%s | Beyond the Trash",
  },
  description:
    "Dashboard analitik pengelolaan sampah Indonesia berdasarkan data SIPSN KLHK 2025.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = getDashboardData();

  return (
    <html lang="id" className={`${jakarta.variable} h-full`}>
      <body className="min-h-full bg-[#F4F7FB] font-sans text-slate-900 antialiased">
        <AppShell data={data}>{children}</AppShell>
      </body>
    </html>
  );
}
