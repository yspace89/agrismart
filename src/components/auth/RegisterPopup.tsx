'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Bot, ExternalLink, ShieldCheck, Globe } from "lucide-react"

export function RegisterPopup({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="font-bold text-agritiva-emerald transition-colors hover:text-agritiva-green focus:outline-none focus:underline bg-transparent border-none p-0">
          {children}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-6 overflow-hidden border border-agritiva-green/10 bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl">
        {/* Minimalist Header */}
        <div className="flex flex-col items-center justify-center space-y-3 mb-2">
          <ShieldCheck className="w-10 h-10 text-agritiva-emerald mb-1" />
          <DialogTitle className="text-2xl font-bold text-slate-800 tracking-tight text-center">
            Pendaftaran Eksklusif B2B
          </DialogTitle>
        </div>

        {/* Content Area */}
        {/* Content Area */}
        <div className="space-y-4">
          <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-agritiva-emerald"></div>
            <p className="text-sm text-slate-700 leading-relaxed text-justify relative z-10 mb-4">
              Platform ERP Agritiva saat ini difokuskan khusus untuk keperluan <strong>Business-to-Business (B2B)</strong> melalui jalur undangan.
            </p>
            <a 
              href="https://wa.me/6289606710829" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#128C7E] text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all shadow-sm hover:shadow-md active:scale-[0.98] relative z-10"
            >
              Hubungi Owner via WhatsApp
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </div>

          <div className="flex items-start gap-4 bg-orange-50/50 rounded-xl p-4 border border-orange-100/50">
            <Bot className="w-8 h-8 text-agritiva-gold shrink-0 animate-bounce hover:rotate-12 hover:scale-110 transition-all cursor-pointer duration-300" style={{ animationDuration: '2s' }} />
            <p className="text-sm text-slate-700 leading-relaxed text-justify">
              Sebagai bentuk dukungan kepada sesama penyuka tanaman, fitur <strong className="text-agritiva-gold">Asisten AI Tiva</strong> kami buka secara <strong className="text-agritiva-emerald">Publik</strong>! Silakan sapa Tiva di pojok kanan bawah.
            </p>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 flex flex-col gap-3">
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Membutuhkan <em>custom app</em> untuk kebutuhan transformasi digital dan efisiensi bisnis Anda? Lihat profil owner kami untuk mengenal dan langkah awal menjalin kerjasama.
            </p>
            <a 
              href="https://yahyaux.web.id" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex self-start items-center justify-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold py-2 px-4 rounded-lg transition-all shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-agritiva-emerald" />
              Lihat Profil Owner
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
