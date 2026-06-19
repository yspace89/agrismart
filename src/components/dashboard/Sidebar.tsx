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

  const activeNavItems = mode === 'pro' ? navItemsPro : navItemsGarden;

  return (
    <div className="hidden md:flex flex-col h-screen w-64 glass-panel border-r-0 shadow-soft text-slate-600 z-10 m-4 rounded-3xl overflow-hidden">
      <div className="p-6 border-b border-white/50">
        <div className="flex items-center gap-2">
          {/* Agritiva brand mark — A dengan daun */}
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #1b4332 60%, #c06c35 100%)', boxShadow: '0 4px 10px rgba(27,67,50,0.2)'}}>
            <span className="text-white font-black text-sm tracking-tighter">A</span>
          </div>
          <h1 className="text-xl font-black tracking-tight" style={{color: '#1b4332'}}>Agritiva</h1>
        </div>
        <p className="text-[10px] uppercase tracking-widest mt-2 font-semibold" style={{color: '#40916c'}}>
          {mode === 'pro' ? "Pro Solutions" : "Smart Farming"}
        </p>
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

      <div className="p-4 border-t border-white/50">
        <div className="space-y-1">
          <button
            onClick={toggleMode}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/60 hover:text-slate-900 transition-all text-slate-500 text-left font-medium"
          >
            <Settings className="w-5 h-5 text-slate-400" />
            <span className="text-sm">Ganti Mode ({mode === 'pro' ? 'Pro' : 'Garden'})</span>
          </button>
          
          <button
            onClick={subscribeToPush}
            disabled={isSubscribed}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left font-medium",
              isSubscribed ? "text-[#2d6a4f] bg-white/40" : "hover:bg-white/60 hover:text-slate-900 text-slate-500"
            )}
          >
            {isSubscribed ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5 text-slate-400" />}
            <span className="text-sm">
              {isSubscribed ? "Notifikasi Aktif" : "Aktifkan Notifikasi"}
            </span>
          </button>

          <form action={async () => {
            const { logout } = await import('@/app/login/actions');
            await logout();
          }}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all text-slate-500 text-left group font-medium mt-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out text-slate-400 group-hover:text-red-500"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              <span className="text-sm">Logout</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
