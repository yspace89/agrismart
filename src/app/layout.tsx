import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/dashboard/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agrinova ERP | Predictive Agriculture",
  description: "Platform Manajemen Agrikultur Cerdas",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
};

import { UserModeProvider } from "@/contexts/UserModeContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-slate-950 text-slate-50`}>
        <UserModeProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-slate-900/50">
              {children}
            </main>
          </div>
        </UserModeProvider>
      </body>
    </html>
  );
}
