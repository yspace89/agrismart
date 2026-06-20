"use client";

import { Bell, User, Settings, LogOut, Sprout } from "lucide-react";
import { useUserMode } from "@/contexts/UserModeContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ModeSwitcherModal } from "./ModeSwitcherModal";
import { usePathname } from "next/navigation";

export function TopBar() {
  const { mode } = useUserMode();
  const [isModeModalOpen, setIsModeModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ email?: string, name?: string }>({});
  const pathname = usePathname();

  if (['/login', '/register', '/forgot-password', '/update-password'].some(p => pathname.startsWith(p))) return null;

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch profile
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        setUserProfile({
          email: user.email,
          name: data?.full_name || "Petani Agritiva"
        });
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    // Memanggil server action via form POST atau fetch API route (sesuai implementasi yg ada)
    // Untuk simpel kita redirect ke /login yang mana ada form action logout atau panggil auth.signOut
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <>
      <header className="h-14 px-4 md:px-6 flex items-center justify-between border-b border-slate-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2 md:hidden">
          {/* Mobile Brand */}
          <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Agritiva Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-[#1b4332] text-lg tracking-tight">Agritiva</span>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {/* Desktop Title / Breadcrumbs placeholder */}
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
            {mode === 'pro' ? 'Pro Solutions' : 'Smart Farming'}
          </span>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
            <Bell className="w-5 h-5" />
            {/* Notification Badge */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
          </button>

          <Popover>
            <PopoverTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                <User className="w-4 h-4 text-slate-400" />
              </div>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-2 rounded-2xl shadow-xl border-slate-100">
              <div className="p-3 border-b border-slate-100 mb-2">
                <p className="font-bold text-slate-800 truncate">{userProfile.name}</p>
                <p className="text-xs text-slate-500 truncate">{userProfile.email}</p>
              </div>

              <div className="space-y-1">
                <button 
                  onClick={() => setIsModeModalOpen(true)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <Sprout className="w-4 h-4 text-emerald-600" />
                  Mode Aplikasi
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                    {mode}
                  </span>
                </button>
                
                <a href="/profile" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                  <Settings className="w-4 h-4" />
                  Pengaturan
                </a>

                <div className="h-px bg-slate-100 my-2" />

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {/* Render Mode Switcher Modal here so it's accessible */}
      <ModeSwitcherModal 
        isOpen={isModeModalOpen} 
        onClose={() => setIsModeModalOpen(false)} 
      />
    </>
  );
}
