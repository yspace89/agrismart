"use client";

import Link from "next/link";
import { LayoutDashboard, Leaf, Banknote, Package, Settings, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

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

  return (
    <div className="flex flex-col h-screen w-64 bg-slate-950 border-r border-slate-800 text-slate-300">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-emerald-500 tracking-tighter">AgriSmart</h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Industrial ERP</p>
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
          {secondaryNav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-900 hover:text-white transition-all text-slate-400"
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
