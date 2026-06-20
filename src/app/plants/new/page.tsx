"use client";

import { useState, useTransition } from 'react';
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
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processImageWithWatermark = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const doDraw = (locationText: string) => {
        const img = new window.Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject("Canvas context failed");
          
          ctx.drawImage(img, 0, 0);
          
          const now = new Date();
          const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
          const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
          const dateStr = now.toLocaleDateString('id-ID', dateOptions);
          const timeStr = now.toLocaleTimeString('id-ID', timeOptions);
          const textLine1 = `${dateStr} - ${timeStr}`;
          const textLine2 = locationText;
          
          const fontSize = Math.max(16, Math.floor(canvas.height * 0.03));
          ctx.font = `bold ${fontSize}px sans-serif`;
          
          const padding = fontSize;
          const metrics1 = ctx.measureText(textLine1);
          const metrics2 = ctx.measureText(textLine2);
          const textWidth = Math.max(metrics1.width, metrics2.width);
          
          const rectX = canvas.width - textWidth - (padding * 2);
          const rectY = canvas.height - (fontSize * 2.5) - (padding * 2);
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(rectX, rectY, textWidth + (padding * 2), (fontSize * 2.5) + (padding * 2));
          
          ctx.fillStyle = 'white';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(textLine1, rectX + padding, rectY + padding);
          ctx.fillText(textLine2, rectX + padding, rectY + padding + fontSize * 1.2);
          
          canvas.toBlob((blob) => {
            if (!blob) return reject("Blob failed");
            const newFile = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
            resolve(newFile);
          }, 'image/jpeg', 0.85);
        };
        img.onerror = reject;
        img.src = objectUrl;
      };

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude.toFixed(5);
            const lng = position.coords.longitude.toFixed(5);
            doDraw(`Lat: ${lat}, Long: ${lng}`);
          },
          (error) => {
            console.warn("Location error:", error);
            doDraw("Lokasi tidak diketahui");
          },
          { timeout: 5000, enableHighAccuracy: true }
        );
      } else {
        doDraw("GPS tidak tersedia");
      }
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        const watermarkedFile = await processImageWithWatermark(file);
        setProcessedFile(watermarkedFile);
        const url = URL.createObjectURL(watermarkedFile);
        setPhotoPreview(url);
      } catch (err) {
        console.error("Gagal menambahkan watermark", err);
        // Fallback to original
        setProcessedFile(file);
        setPhotoPreview(URL.createObjectURL(file));
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (processedFile) {
      formData.set('photo', processedFile);
    }
    startTransition(() => {
      addPlant(formData);
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-32 px-4 md:px-0">
      <div className="flex items-center gap-4 mb-8 pt-4">
        <Link href="/plants">
          <Button variant="ghost" className="rounded-full w-10 h-10 p-0 text-slate-500 hover:text-slate-900 bg-white/60 shadow-sm border border-white/80 transition-all hover:bg-white hover:scale-105">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Tambah Tanaman Baru</h1>
      </div>

      {!purpose ? (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-2 mb-8 mt-4">
            <h2 className="text-lg font-bold text-slate-700">Apa tujuan Anda menanam ini? 🤔</h2>
            <p className="text-slate-500 font-medium text-sm">Pilih salah satu agar kami bisa menyesuaikan formulir untuk Anda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <button 
              type="button"
              onClick={() => setPurpose('Hiasan')}
              className="glass-panel border-white/80 shadow-soft rounded-2xl p-5 text-left hover:-translate-y-1 hover:shadow-xl hover:bg-white/60 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-pink-100/50 rounded-full blur-2xl group-hover:bg-pink-200/50 transition-colors" />
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:rotate-6 transition-transform shadow-inner relative z-10">🌸</div>
              <h3 className="text-lg font-black text-slate-800 mb-1 relative z-10">Untuk Hiasan</h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed relative z-10">Fokus pada perawatan, penyiraman, dan estetika. Cocok untuk Monstera, Kaktus.</p>
            </button>

            <button 
              type="button"
              onClick={() => setPurpose('Panen')}
              className="glass-panel border-white/80 shadow-soft rounded-2xl p-5 text-left hover:-translate-y-1 hover:shadow-xl hover:bg-white/60 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-green-100/50 rounded-full blur-2xl group-hover:bg-green-200/50 transition-colors" />
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:-rotate-6 transition-transform shadow-inner relative z-10">🥬</div>
              <h3 className="text-lg font-black text-slate-800 mb-1 relative z-10">Untuk Panen</h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed relative z-10">Fokus pada estimasi panen dan pemupukan. Cocok untuk Sayur, Buah, Bumbu.</p>
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
                <h2 className="font-black text-base text-slate-800 tracking-tight">{purpose === 'Hiasan' ? 'Tanaman Hias' : 'Sayur & Dapur'}</h2>
                <button type="button" onClick={() => setPurpose(null)} className="text-xs text-blue-600 font-bold hover:underline">Ganti Tujuan</button>
              </div>
            </div>
          </div>

          <Card className="glass-panel border-white/80 shadow-soft rounded-2xl overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                <input type="hidden" name="planting_purpose" value={purpose} />
                
                {/* Photo Upload Area */}
                <div className="flex justify-center mb-8">
                  <label htmlFor="photo-upload" className="relative w-32 h-32 rounded-full border-4 border-dashed border-slate-300 bg-slate-50/50 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-white hover:border-[#40916c] hover:text-[#40916c] transition-all duration-300 group shadow-sm hover:shadow-md overflow-hidden">
                    {photoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Camera className="w-8 h-8 mb-2 group-hover:-translate-y-1 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Tambah Foto</span>
                      </>
                    )}
                    {isProcessing && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white z-10">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mb-2" />
                        <span className="text-[10px] font-bold">Memproses...</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      id="photo-upload" 
                      name="photo" 
                      accept="image/*" 
                      capture="environment" 
                      className="hidden" 
                      onChange={handlePhotoChange} 
                    />
                  </label>
                </div>

                {purpose === 'Hiasan' ? (
                  /* ==========================================
                     FORM HIASAN
                     ========================================== */
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700">Nama Panggilan Tanaman <span className="text-red-500">*</span></label>
                      <Input name="name" required placeholder="Contoh: Janda Bolong Depan, Kaktus Budi" className="h-12 px-4 rounded-xl bg-white/80 border-slate-200 text-slate-900 focus:bg-white focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 shadow-sm transition-all" />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700">Kategori <span className="text-red-500">*</span></label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['Hias', 'Bunga', 'Sukulen', 'Herbal'].map(type => (
                          <label key={type} className="relative cursor-pointer group">
                            <input type="radio" name="type" value={type} className="peer sr-only" defaultChecked={type === 'Hias'} />
                            <div className="px-4 py-3 text-sm font-bold text-center text-slate-500 bg-white/60 border border-slate-200 rounded-xl hover:bg-white peer-checked:bg-green-50 peer-checked:border-green-500 peer-checked:text-green-700 transition-all shadow-sm group-hover:shadow-md">
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
                      <Input name="name" required placeholder="Contoh: Cabai Rawit, Tomat Cherry, Kangkung" className="h-12 px-4 rounded-xl bg-white/80 border-slate-200 text-slate-900 focus:bg-white focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 shadow-sm transition-all" />
                      <input type="hidden" name="type" value="Sayuran" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700">Jumlah / Wadah</label>
                        <Input name="quantity_description" placeholder="Misal: 5 Polybag, 1 Bedengan" className="h-12 px-4 rounded-xl bg-white/80 border-slate-200 text-slate-900 focus:bg-white focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 shadow-sm transition-all" />
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700">Fase Saat Ini</label>
                        <select name="growth_stage" className="h-12 px-4 w-full rounded-xl border border-slate-200 bg-white/80 font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 shadow-sm transition-all appearance-none cursor-pointer">
                          <option value="Semai">Baru Semai / Bibit</option>
                          <option value="Vegetatif">Pertumbuhan Daun (Vegetatif)</option>
                          <option value="Berbunga/Berbuah">Mulai Berbunga/Berbuah</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700">Tanggal Mulai Tanam</label>
                        <Input name="planted_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="h-12 px-4 rounded-xl bg-white/80 border-slate-200 text-slate-900 focus:bg-white focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 shadow-sm transition-all" />
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700">Estimasi Panen (Hari)</label>
                        <Input name="estimated_harvest_days" type="number" placeholder="Misal: 30" className="h-12 px-4 rounded-xl bg-white/80 border-slate-200 text-slate-900 focus:bg-white focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 shadow-sm transition-all" />
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
                  <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm font-bold text-agritiva-emerald hover:text-agritiva-green transition-colors flex items-center gap-2 mb-6">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#52b788]/20">{showAdvanced ? '-' : '+'}</span>
                    {showAdvanced ? 'Sembunyikan Opsi Tambahan' : 'Tampilkan Opsi Tambahan (Spesies, Lokasi, Catatan)'}
                  </button>

                  {showAdvanced && (
                    <div className="space-y-6 animate-in slide-in-from-top-4 duration-300 bg-slate-50/50 p-6 rounded-2xl border border-slate-200/60">
                      {purpose === 'Hiasan' && (
                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-700">Nama Spesies Ilmiah</label>
                          <Input name="species" placeholder="Misal: Monstera adansonii" className="h-12 px-4 bg-white border-slate-200 rounded-xl focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 transition-all" />
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Sun className="w-4 h-4 text-amber-500" /> Kebutuhan Cahaya
                          </label>
                          <select name="light_requirement" className="h-12 px-4 w-full rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 transition-all appearance-none cursor-pointer">
                            <option value="">Pilih...</option>
                            <option value="Full Sun (Matahari Langsung)">Full Sun (Matahari Langsung)</option>
                            <option value="Partial Sun (Teduh Parsial)">Partial Sun (Teduh Parsial)</option>
                            <option value="Indoor (Dalam Ruangan)">Indoor (Dalam Ruangan)</option>
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-700">Lokasi Penempatan</label>
                          <Input name="location" placeholder="Teras Depan, Balkon, Meja Kerja" className="h-12 px-4 bg-white border-slate-200 rounded-xl focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 transition-all" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700">Catatan Pribadi</label>
                        <textarea name="notes" rows={3} placeholder="Catatan media tanam, asal bibit, komposisi pupuk" className="flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 transition-all placeholder:text-slate-400 resize-none" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <Button type="submit" disabled={isPending || isProcessing} className="w-full h-12 text-sm rounded-xl font-black tracking-wide bg-gradient-to-r from-agritiva-green to-agritiva-emerald hover:from-[#143627] hover:to-agritiva-green text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-70 disabled:hover:-translate-y-0 disabled:cursor-not-allowed">
                    {isPending ? 'Menyimpan...' : 'Simpan ke Kebun Saya 🪴'}
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
