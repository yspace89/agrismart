"use client";

import Link from "next/link";
import { LayoutDashboard, Leaf, Banknote, Package, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useUserMode } from "@/contexts/UserModeContext";

export function BottomBar() {
  const pathname = usePathname();
  const { mode } = useUserMode();

  if (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/update-password') {
    return null;
  }

  const navItemsPro = [
    { name: "Beranda", href: "/", icon: LayoutDashboard },
    { name: "Lahan", href: "/lands", icon: Leaf },
    { name: "Dana", href: "/finance", icon: Banknote },
    { name: "Stok", href: "/inventory", icon: Package },
  ];

  const navItemsGarden = [
    { name: "Beranda", href: "/garden", icon: LayoutDashboard },
    { name: "Tanaman", href: "/plants", icon: Sprout },
    { name: "Belanja", href: "/shopping", icon: Banknote },
  ];

  const activeNavItems = mode === 'pro' ? navItemsPro : navItemsGarden;

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 h-14 glass-panel-heavy rounded-2xl z-50 flex items-center justify-around px-2 shadow-soft">
      {activeNavItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className="relative flex flex-col items-center justify-center w-16 h-full gap-1 group"
          >
            {/* Active Dot Indicator */}
            {isActive && (
              <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full animate-in zoom-in bg-agritiva-emerald" />
            )}
            
            <item.icon 
              className={cn(
                "w-4 h-4 transition-all duration-300", 
                isActive ? "scale-110 -translate-y-1 text-agritiva-emerald" : "text-slate-400 group-hover:text-slate-600 group-active:scale-95"
              )}
            />
            <span 
              className={cn(
                "text-[10px] font-bold transition-colors duration-300 tracking-wide",
                isActive ? "text-agritiva-emerald" : "text-slate-400 group-hover:text-slate-600"
              )}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
