"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addPlant } from '@/lib/garden-actions';
import Link from 'next/link';
import { Leaf, Utensils, Camera, Sprout, Sun, Droplet, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NewPlantPage() {
  const [purpose, setPurpose] = useState<'Hiasan' | 'Panen' | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-32 px-4 md:px-0">
      <div className="flex items-center gap-4 mb-8 pt-4">
        <Link href="/plants">
          <Button variant="ghost" className="rounded-full w-10 h-10 p-0 text-slate-500 hover:text-slate-900 bg-white/60 shadow-sm border border-white/80 transition-all hover:bg-white hover:scale-105">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tambah Tanaman Baru</h1>
      </div>

      {!purpose ? (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-2 mb-8 mt-4">
            <h2 className="text-xl font-bold text-slate-700">Apa tujuan Anda menanam ini? 🤔</h2>
            <p className="text-slate-500 font-medium text-sm">Pilih salah satu agar kami bisa menyesuaikan formulir untuk Anda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <button 
              type="button"
              onClick={() => setPurpose('Hiasan')}
              className="glass-panel border-white/80 shadow-soft rounded-[2rem] p-8 text-left hover:-translate-y-1 hover:shadow-xl hover:bg-white/60 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-pink-100/50 rounded-full blur-2xl group-hover:bg-pink-200/50 transition-colors" />
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-3xl mb-5 group-hover:rotate-6 transition-transform shadow-inner relative z-10">🌸</div>
              <h3 className="text-xl font-black text-slate-800 mb-2 relative z-10">Untuk Hiasan & Koleksi</h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed relative z-10">Fokus pada perawatan, penyiraman, dan estetika. Cocok untuk Monstera, Kaktus, Aglonema.</p>
            </button>

            <button 
              type="button"
              onClick={() => setPurpose('Panen')}
              className="glass-panel border-white/80 shadow-soft rounded-[2rem] p-8 text-left hover:-translate-y-1 hover:shadow-xl hover:bg-white/60 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-green-100/50 rounded-full blur-2xl group-hover:bg-green-200/50 transition-colors" />
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-3xl mb-5 group-hover:-rotate-6 transition-transform shadow-inner relative z-10">🥬</div>
              <h3 className="text-xl font-black text-slate-800 mb-2 relative z-10">Untuk Sayur & Dapur</h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed relative z-10">Fokus pada estimasi panen dan pemupukan. Cocok untuk Cabai, Tomat, Kangkung, Bumbu.</p>
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-in slide-in-from-right-8 duration-500 space-y-6">
          <div className="flex items-center justify-between mb-2 px-2">
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-white/50", purpose === 'Hiasan' ? 'bg-pink-100' : 'bg-green-100')}>
                {purpose === 'Hiasan' ? '🌸' : '🥬'}
              </div>
              <div>
                <h2 className="font-black text-lg text-slate-800 tracking-tight">{purpose === 'Hiasan' ? 'Tanaman Hias' : 'Sayur & Dapur'}</h2>
                <button type="button" onClick={() => setPurpose(null)} className="text-xs text-blue-600 font-bold hover:underline">Ganti Tujuan</button>
              </div>
            </div>
          </div>

          <Card className="glass-panel border-white/80 shadow-soft rounded-[2rem] overflow-hidden">
            <CardContent className="p-6 md:p-10">
              <form action={addPlant} className="space-y-8">
                <input type="hidden" name="planting_purpose" value={purpose} />
                
                {/* Photo Upload Area */}
                <div className="flex justify-center mb-10">
                  <div className="w-32 h-32 rounded-full border-4 border-dashed border-slate-300 bg-slate-50/50 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-white hover:border-[#40916c] hover:text-[#40916c] transition-all duration-300 group shadow-sm hover:shadow-md hover:scale-105">
                    <Camera className="w-8 h-8 mb-2 group-hover:-translate-y-1 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Tambah Foto</span>
                  </div>
                </div>

                {purpose === 'Hiasan' ? (
                  /* ==========================================
                     FORM HIASAN
                     ========================================== */
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700">Nama Panggilan Tanaman <span className="text-red-500">*</span></label>
                      <Input name="name" required placeholder="Contoh: Janda Bolong Depan, Kaktus Budi" className="h-14 px-4 rounded-2xl bg-white/80 border-slate-200 text-slate-900 focus:bg-white focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 shadow-sm transition-all" />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700">Kategori <span className="text-red-500">*</span></label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['Hias', 'Bunga', 'Sukulen', 'Herbal'].map(type => (
                          <label key={type} className="relative cursor-pointer group">
                            <input type="radio" name="type" value={type} className="peer sr-only" defaultChecked={type === 'Hias'} />
                            <div className="px-4 py-4 text-sm font-bold text-center text-slate-500 bg-white/60 border border-slate-200 rounded-2xl hover:bg-white peer-checked:bg-green-50 peer-checked:border-green-500 peer-checked:text-green-700 transition-all shadow-sm group-hover:shadow-md">
                              {type}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-blue-500" /> Rutinitas Penyiraman (Hari) <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-4 items-center bg-white/60 p-2 rounded-2xl border border-slate-200 shadow-sm">
                        <Input name="water_frequency_days" type="number" min="1" defaultValue="2" required className="h-12 w-24 rounded-xl bg-white border-slate-200 text-center font-bold text-xl focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 transition-all" />
                        <span className="text-sm font-medium text-slate-500 pr-4">Tiap berapa hari sekali disiram?</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ==========================================
                     FORM SAYUR & DAPUR
                     ========================================== */
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700">Jenis Sayur / Buah <span className="text-red-500">*</span></label>
                      <Input name="name" required placeholder="Contoh: Cabai Rawit, Tomat Cherry, Kangkung" className="h-14 px-4 rounded-2xl bg-white/80 border-slate-200 text-slate-900 focus:bg-white focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 shadow-sm transition-all" />
                      <input type="hidden" name="type" value="Sayuran" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700">Jumlah / Wadah</label>
                        <Input name="quantity_description" placeholder="Misal: 5 Polybag, 1 Bedengan" className="h-14 px-4 rounded-2xl bg-white/80 border-slate-200 text-slate-900 focus:bg-white focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 shadow-sm transition-all" />
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700">Fase Saat Ini</label>
                        <select name="growth_stage" className="h-14 px-4 w-full rounded-2xl border border-slate-200 bg-white/80 font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 shadow-sm transition-all appearance-none cursor-pointer">
                          <option value="Semai">Baru Semai / Bibit</option>
                          <option value="Vegetatif">Pertumbuhan Daun (Vegetatif)</option>
                          <option value="Berbunga/Berbuah">Mulai Berbunga/Berbuah</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700">Tanggal Mulai Tanam</label>
                        <Input name="planted_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="h-14 px-4 rounded-2xl bg-white/80 border-slate-200 text-slate-900 focus:bg-white focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 shadow-sm transition-all" />
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700">Estimasi Panen (Hari)</label>
                        <Input name="estimated_harvest_days" type="number" placeholder="Misal: 30" className="h-14 px-4 rounded-2xl bg-white/80 border-slate-200 text-slate-900 focus:bg-white focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 shadow-sm transition-all" />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-blue-500" /> Rutinitas Penyiraman (Hari) <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-4 items-center bg-white/60 p-2 rounded-2xl border border-slate-200 shadow-sm w-max">
                        <Input name="water_frequency_days" type="number" min="1" defaultValue="1" required className="h-12 w-24 rounded-xl bg-white border-slate-200 text-center font-bold text-xl focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 transition-all" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-slate-200/60 mt-8">
                  <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm font-bold text-[#2d6a4f] hover:text-[#1b4332] transition-colors flex items-center gap-2 mb-6">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#52b788]/20">{showAdvanced ? '-' : '+'}</span>
                    {showAdvanced ? 'Sembunyikan Opsi Tambahan' : 'Tampilkan Opsi Tambahan (Spesies, Lokasi, Catatan)'}
                  </button>

                  {showAdvanced && (
                    <div className="space-y-6 animate-in slide-in-from-top-4 duration-300 bg-slate-50/50 p-6 rounded-3xl border border-slate-200/60">
                      {purpose === 'Hiasan' && (
                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-700">Nama Spesies Ilmiah</label>
                          <Input name="species" placeholder="Misal: Monstera adansonii" className="h-14 px-4 bg-white border-slate-200 rounded-2xl focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 transition-all" />
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Sun className="w-4 h-4 text-amber-500" /> Kebutuhan Cahaya
                          </label>
                          <select name="light_requirement" className="h-14 px-4 w-full rounded-2xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 transition-all appearance-none cursor-pointer">
                            <option value="">Pilih...</option>
                            <option value="Full Sun (Matahari Langsung)">Full Sun (Matahari Langsung)</option>
                            <option value="Partial Sun (Teduh Parsial)">Partial Sun (Teduh Parsial)</option>
                            <option value="Indoor (Dalam Ruangan)">Indoor (Dalam Ruangan)</option>
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-700">Lokasi Penempatan</label>
                          <Input name="location" placeholder="Teras Depan, Balkon, Meja Kerja" className="h-14 px-4 bg-white border-slate-200 rounded-2xl focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 transition-all" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700">Catatan Pribadi</label>
                        <textarea name="notes" rows={3} placeholder="Catatan media tanam, asal bibit, komposisi pupuk" className="flex w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 transition-all placeholder:text-slate-400 resize-none" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full h-16 text-lg rounded-[2rem] font-black tracking-wide bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] hover:from-[#143627] hover:to-[#1b4332] text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]">
                    Simpan ke Kebun Saya 🪴
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
