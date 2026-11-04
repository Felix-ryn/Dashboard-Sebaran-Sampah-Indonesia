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
    default: "Jejak Sampah | Dashboard Sampah 2025",
    template: "%s | Jejak Sampah",
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
    <html lang="id" className={`${jakarta.variable} h-full`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}",
          }}
        />
      </head>
      <body className="h-full bg-canvas font-sans text-ink antialiased">
        <AppShell data={data}>{children}</AppShell>
      </body>
    </html>
  );
}
