import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/dashboard/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agritiva | Integrated Farming Solutions",
  description: "Platform Manajemen Pertanian Terpadu — Agritiva Integrated Farming Solutions",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#1b4332",
};

import { UserModeProvider } from "@/contexts/UserModeContext";
import { BottomBar } from "@/components/dashboard/BottomBar";
import { TopBar } from "@/components/dashboard/TopBar";
import { AIChatPanel } from "@/components/dashboard/AIChatPanel";
import { MainContentWrapper } from "@/components/dashboard/MainContentWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-slate-50 text-slate-800`}>
        <UserModeProvider>
          <div className="flex h-screen overflow-hidden bg-slate-50">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <TopBar />
              <MainContentWrapper>
                {children}
              </MainContentWrapper>
            </div>
            <BottomBar />
            <AIChatPanel />
          </div>
        </UserModeProvider>
      </body>
    </html>
  );
}
