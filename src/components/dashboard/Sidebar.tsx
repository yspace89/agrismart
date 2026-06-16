"use client";

import Link from "next/link";
import { LayoutDashboard, Leaf, Banknote, Package, Settings, HelpCircle, Bell, BellRing, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useUserMode } from "@/contexts/UserModeContext";
import { useState, useEffect } from "react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Manajemen Lahan", href: "/lands", icon: Leaf },
  { name: "Keuangan", href: "/finance", icon: Banknote },
  { name: "Inventaris", href: "/inventory", icon: Package },
];

const secondaryNav = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Bantuan", href: "/help", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { mode, toggleMode } = useUserMode();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setIsSubscribed(true);
        });
      });
    }
  }, []);

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

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: mode === 'pro' ? "Manajemen Lahan" : "Kebunku", href: "/lands", icon: mode === 'pro' ? Leaf : Sprout },
    { name: mode === 'pro' ? "Keuangan" : "Pengeluaran", href: "/finance", icon: Banknote },
    { name: mode === 'pro' ? "Inventaris" : "Gudang", href: "/inventory", icon: Package },
  ];

  return (
    <div className="flex flex-col h-screen w-64 bg-slate-950 border-r border-slate-800 text-slate-300">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-emerald-500 tracking-tighter">AgriSmart</h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
          {mode === 'pro' ? "Industrial ERP" : "Urban Farming"}
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
              pathname === item.href 
                ? "bg-emerald-500/10 text-emerald-500 shadow-[inset_0px_0px_10px_rgba(16,185,129,0.1)]" 
                : "hover:bg-slate-900 hover:text-white"
            )}
          >
            <item.icon className={cn("w-5 h-5", pathname === item.href ? "text-emerald-500" : "text-slate-400 group-hover:text-white")} />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-900">
        <div className="space-y-1">
          <button
            onClick={toggleMode}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-900 hover:text-white transition-all text-slate-400 text-left"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Ganti Mode ({mode === 'pro' ? 'Pro' : 'Garden'})</span>
          </button>
          
          <button
            onClick={subscribeToPush}
            disabled={isSubscribed}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left",
              isSubscribed ? "text-emerald-500" : "hover:bg-slate-900 hover:text-white text-slate-400"
            )}
          >
            {isSubscribed ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            <span className="font-medium text-sm">
              {isSubscribed ? "Notifikasi Aktif" : "Aktifkan Notifikasi"}
            </span>
          </button>

          <form action={async () => {
            const { logout } = await import('@/app/login/actions');
            await logout();
          }}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all text-slate-400 text-left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              <span className="font-medium text-sm">Logout</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
