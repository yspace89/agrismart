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
        <div className="space-y-5">
          <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-agritiva-emerald"></div>
            <p className="text-sm text-slate-700 leading-relaxed text-justify relative z-10">
              Platform ERP Agritiva saat ini difokuskan khusus untuk keperluan <strong>Business-to-Business (B2B)</strong> melalui jalur undangan.
            </p>
          </div>

          <div className="flex items-start gap-4 bg-orange-50/50 rounded-xl p-4 border border-orange-100/50">
            <Bot className="w-8 h-8 text-agritiva-gold shrink-0 animate-bounce hover:rotate-12 hover:scale-110 transition-all cursor-pointer duration-300" style={{ animationDuration: '2s' }} />
            <p className="text-sm text-slate-700 leading-relaxed text-justify">
              Sebagai bentuk dedikasi membangun petani Indonesia, fitur <strong className="text-agritiva-gold">Asisten AI Tiva</strong> kami buka secara <strong className="text-agritiva-emerald">Publik</strong>! Silakan sapa Tiva di pojok kanan bawah.
            </p>
          </div>

          <div className="pt-2">
            <p className="text-xs text-slate-500 mb-3 text-center">
              Tertarik menjadi mitra atau melihat portfolio kreator?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                href="https://wa.me/6289606710829" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white text-sm font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                WhatsApp Owner
                <ExternalLink className="w-4 h-4" />
              </a>
              <a 
                href="https://yahyaux.web.id" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-semibold py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                <Globe className="w-4 h-4 text-agritiva-emerald" />
                yahyaux.web.id
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
