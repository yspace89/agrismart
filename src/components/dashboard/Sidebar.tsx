"use client";

import Link from "next/link";
import { LayoutDashboard, Leaf, Banknote, Package, Settings, HelpCircle, Bell, BellRing, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useUserMode } from "@/contexts/UserModeContext";
import { useState, useEffect } from "react";

const navItemsPro = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Manajemen Lahan", href: "/lands", icon: Leaf },
  { name: "Keuangan", href: "/finance", icon: Banknote },
  { name: "Inventaris", href: "/inventory", icon: Package },
];

const navItemsGarden = [
  { name: "Beranda", href: "/garden", icon: LayoutDashboard },
  { name: "Tanamanku", href: "/plants", icon: Sprout },
  { name: "Belanjaan", href: "/shopping", icon: Banknote },
];

export function Sidebar() {
  const pathname = usePathname();
  const { mode } = useUserMode();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  if (['/login', '/register', '/forgot-password', '/update-password'].some(p => pathname.startsWith(p))) return null;

  useEffect(() => {
    // Jangan daftarkan service worker di halaman auth untuk menghindari error redirect
    if (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/update-password') {
      return;
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setIsSubscribed(true);
        }).catch(() => {
          // Abaikan error minor pushManager
        });
      }).catch((error) => {
        // Abaikan pesan error SecurityError redirect Next.js
        console.warn('[PWA] Service Worker registration skipped:', error.message);
      });
    }
  }, [pathname]);

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert("Push notifications not supported by your browser.");
      return;
    }
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        body: JSON.stringify({ subscription }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setIsSubscribed(true);
        alert("Notifikasi berhasil diaktifkan!");
      } else {
        alert("Gagal mengaktifkan notifikasi.");
      }
    } catch (err) {
      console.error("Failed to subscribe:", err);
      alert("Gagal mengaktifkan notifikasi. Pastikan Anda memberi izin.");
    }
  };

  if (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/update-password') {
    return null;
  }

  const activeNavItems = mode === 'pro' ? navItemsPro : navItemsGarden;

  return (
    <div className="hidden md:flex flex-col h-screen w-64 glass-panel border-r-0 shadow-soft text-slate-600 z-10 m-4 rounded-3xl overflow-hidden">
      <div className="p-6 border-b border-white/50">
        <div className="flex items-center gap-2">
          {/* Agritiva brand mark */}
          <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
            <img src="/logo.png" alt="Agritiva Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-black tracking-tight" style={{color: '#1b4332'}}>Agritiva</h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-6">
        {activeNavItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group",
              pathname === item.href 
            ? "bg-white shadow-soft text-[#1b4332] font-bold" 
            : "hover:bg-white/50 hover:text-slate-900"
            )}
          >
            <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", pathname === item.href ? "text-[#2d6a4f]" : "text-slate-400 group-hover:text-slate-600")} />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 mt-auto">
        <div className="space-y-1">
          <button
            onClick={subscribeToPush}
            disabled={isSubscribed}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left font-medium",
              isSubscribed ? "text-[#2d6a4f] bg-slate-100" : "hover:bg-slate-100 hover:text-slate-900 text-slate-500"
            )}
          >
            {isSubscribed ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5 text-slate-400" />}
            <span className="text-sm">
              {isSubscribed ? "Notifikasi Aktif" : "Aktifkan Notifikasi"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
