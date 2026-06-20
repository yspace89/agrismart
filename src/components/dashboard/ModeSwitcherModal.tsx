"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUserMode } from '@/contexts/UserModeContext';
import { Button } from '@/components/ui/button';
import { Sprout, Tractor, CheckCircle2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ModeSwitcherModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { mode, setMode } = useUserMode();

  const handleSwitch = (newMode: "pro" | "garden") => {
    if (newMode === 'pro') {
      window.alert("Mode pertanian komersial ini khusus untuk pelanggan B2B Enterprise. Silakan hubungi tim sales kami untuk informasi lebih lanjut.");
      return;
    }
    setMode(newMode);
    onClose();
    if (newMode === 'garden') {
      window.location.href = '/garden';
    } else {
      window.location.href = '/';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] rounded-[2rem] p-0 overflow-hidden border-0 shadow-2xl bg-white">
        <div className="p-8">
          <DialogHeader className="text-center space-y-2 mb-8">
            <DialogTitle className="text-2xl font-black text-slate-900">Pilih Mode Aplikasi</DialogTitle>
            <p className="text-sm font-medium text-slate-500">Sesuaikan pengalaman Agritiva dengan skala pertanianmu.</p>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Garden Mode */}
            <div 
              className={cn(
                "relative rounded-3xl p-6 border-2 transition-all cursor-pointer group hover:border-[#40916c] hover:shadow-lg",
                mode === 'garden' ? "border-[#40916c] bg-[#40916c]/5" : "border-slate-100 bg-white"
              )}
              onClick={() => handleSwitch('garden')}
            >
              {mode === 'garden' && (
                <div className="absolute top-4 right-4 text-[#40916c]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              )}
              <div className="w-14 h-14 rounded-2xl bg-[#40916c]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sprout className="w-7 h-7 text-[#40916c]" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">🌱 Garden Mode</h3>
              <p className="text-sm text-slate-500 font-medium mb-6">Cocok untuk hobi berkebun di rumah, urban farming, dan skala personal.</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm text-slate-600 font-medium"><CheckCircle2 className="w-4 h-4 text-[#40916c] mt-0.5" /> Jurnal & riwayat tanaman</li>
                <li className="flex items-start gap-2 text-sm text-slate-600 font-medium"><CheckCircle2 className="w-4 h-4 text-[#40916c] mt-0.5" /> AI Tanya Tani (Asisten AI)</li>
                <li className="flex items-start gap-2 text-sm text-slate-600 font-medium"><CheckCircle2 className="w-4 h-4 text-[#40916c] mt-0.5" /> Pengingat jadwal siram</li>
              </ul>

              <Button 
                className="w-full rounded-full font-bold h-12"
                variant={mode === 'garden' ? 'outline' : 'default'}
                style={mode === 'garden' ? { borderColor: '#40916c', color: '#40916c' } : { backgroundColor: '#40916c' }}
                onClick={(e) => { e.stopPropagation(); handleSwitch('garden'); }}
              >
                {mode === 'garden' ? "Sedang Aktif" : "Pilih Garden Mode"}
              </Button>
            </div>

            {/* Pro Mode (LOCKED) */}
            <div 
              className="relative rounded-3xl p-6 border-2 border-slate-100 bg-slate-50 transition-all cursor-not-allowed group opacity-75"
              onClick={() => handleSwitch('pro')}
            >
              <div className="absolute top-4 right-4 text-slate-400 bg-white p-2 rounded-full shadow-sm">
                <Lock className="w-5 h-5" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-slate-200 flex items-center justify-center mb-4 grayscale">
                <Tractor className="w-7 h-7 text-slate-500" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-2">
                🚜 Pro Mode
              </h3>
              <p className="text-sm text-slate-500 font-medium mb-6">Sistem ERP lengkap untuk pertanian komersial dan agribisnis skala besar.</p>
              
              <ul className="space-y-3 mb-8 opacity-60">
                <li className="flex items-start gap-2 text-sm text-slate-600 font-medium"><CheckCircle2 className="w-4 h-4 text-slate-400 mt-0.5" /> Manajemen multi-lahan</li>
                <li className="flex items-start gap-2 text-sm text-slate-600 font-medium"><CheckCircle2 className="w-4 h-4 text-slate-400 mt-0.5" /> Keuangan & budgeting canggih</li>
                <li className="flex items-start gap-2 text-sm text-slate-600 font-medium"><CheckCircle2 className="w-4 h-4 text-slate-400 mt-0.5" /> Prediksi hasil panen (Yield Forecast)</li>
                <li className="flex items-start gap-2 text-sm text-slate-600 font-medium"><CheckCircle2 className="w-4 h-4 text-slate-400 mt-0.5" /> Track inventaris & stok barang</li>
              </ul>

              <div className="flex flex-col gap-2 mt-auto">
                <Button 
                  className="w-full rounded-full font-bold h-12 bg-slate-200 text-slate-500 hover:bg-slate-300"
                  onClick={(e) => { e.stopPropagation(); handleSwitch('pro'); }}
                >
                  <Lock className="w-4 h-4 mr-2" /> Khusus Pelanggan B2B
                </Button>
                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-wider">Hubungi Sales Untuk Akses</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
