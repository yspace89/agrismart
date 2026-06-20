"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { addPlantLog, updatePlantStatus } from '@/lib/garden-actions';
import Link from 'next/link';
import { Droplet, Sun, Calendar, PlusCircle, MapPin, Activity, ArrowLeft, Camera, X, Bell, BellOff, Trash2, Plus } from 'lucide-react';
import Image from 'next/image';

export default function PlantDetailClient({ plant, logs }: { plant: any, logs: any[] }) {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  // State untuk reminders
  type Reminder = { id: string; activity_type: string; frequency_days: number; notification_hour: number; is_active: boolean; };
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [newReminder, setNewReminder] = useState({ activity_type: 'Siram', frequency_days: 1, notification_hour: 7 });

  useEffect(() => {
    fetch(`/api/reminders?plant_id=${plant.id}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setReminders(data); })
      .catch(() => {});
  }, [plant.id]);

  const handleAddReminder = async () => {
    setReminderLoading(true);
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plant_id: plant.id, ...newReminder }),
      });
      const data = await res.json();
      if (res.ok) {
        setReminders(prev => [data, ...prev]);
        setIsReminderModalOpen(false);
      }
    } finally {
      setReminderLoading(false);
    }
  };

  const handleToggleReminder = async (id: string, currentActive: boolean) => {
    const res = await fetch(`/api/reminders?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !currentActive }),
    });
    if (res.ok) {
      setReminders(prev => prev.map(r => r.id === id ? { ...r, is_active: !currentActive } : r));
    }
  };

  const handleDeleteReminder = async (id: string) => {
    const res = await fetch(`/api/reminders?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setReminders(prev => prev.filter(r => r.id !== id));
    }
  };

  // Status Colors
  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Sehat': return 'bg-green-100 text-green-800 border-green-200';
      case 'Sakit': return 'bg-red-100 text-red-800 border-red-200';
      case 'Kering': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Panen': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-32">
      {/* 1. Edge-to-Edge Hero Section */}
      <div className="relative w-full h-[40vh] min-h-[300px] overflow-hidden bg-gradient-to-br from-[#d8f3dc] to-[#74c69d]">
        {/* Abstract shapes if no photo */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-10 -left-20 w-64 h-64 bg-agritiva-green rounded-full blur-3xl mix-blend-multiply" />
          <div className="absolute bottom-10 -right-10 w-48 h-48 bg-[#95d5b2] rounded-full blur-2xl mix-blend-multiply" />
        </div>
        
        {plant.photo_url && (
          <Image 
            src={plant.photo_url} 
            alt={plant.name}
            fill
            className="object-cover"
            priority
          />
        )}

        {/* Top Gradient for readability */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/40 to-transparent z-10" />
        
        {/* Back Button - Floating */}
        <Link href="/plants" className="absolute top-6 left-6 z-20">
          <Button variant="ghost" className="rounded-full w-12 h-12 p-0 text-white hover:text-slate-900 bg-black/20 hover:bg-white/90 backdrop-blur-md transition-all shadow-lg">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>

        {/* Hero Title Container */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#fafaf9] via-[#fafaf9]/80 to-transparent pt-32 z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto flex justify-between items-end"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2 drop-shadow-sm">{plant.name}</h1>
              <p className="text-sm md:text-base font-bold text-slate-500 tracking-wide uppercase">{plant.type} {plant.species ? `• ${plant.species}` : ''}</p>
            </div>
            
            {/* Status Pill - Clickable to change status */}
            <button 
              onClick={() => setIsStatusModalOpen(true)}
              className={`text-sm px-5 py-2 rounded-full font-black shadow-sm border transition-transform hover:scale-105 active:scale-95 ${getStatusStyle(plant.status)}`}
            >
              {plant.status}
            </button>
          </motion.div>
        </div>
      </div>

      {/* 2. Main Content Wrapper */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-8 space-y-12">
        
        {/* Plant Vitals (Glass Pills) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-4"
        >
          <div className="flex-1 min-w-[140px] bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 flex items-center justify-center">
              <Droplet className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Siram</p>
              <p className="text-sm font-black text-slate-800">Tiap {plant.water_frequency_days} Hari</p>
            </div>
          </div>
          
          <div className="flex-1 min-w-[140px] bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Sun className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cahaya</p>
              <p className="text-sm font-black text-slate-800 truncate" title={plant.light_requirement || 'Belum diatur'}>
                {plant.light_requirement || '-'}
              </p>
            </div>
          </div>

          <div className="flex-1 min-w-[140px] bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ditanam</p>
              <p className="text-sm font-black text-slate-800">
                {new Date(plant.planted_date || plant.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
        </motion.div>

        {plant.notes && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-orange-50/50 p-6 rounded-[2rem] border border-orange-100/50"
          >
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Catatan</p>
            <p className="text-sm font-medium text-slate-700 leading-relaxed">{plant.notes}</p>
          </motion.div>
        )}

        {/* 3. Story-like Timeline (Riwayat) */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Jurnal Perawatan</h2>
          
          {logs && logs.length > 0 ? (
            <div className="space-y-8">
              {logs.map((log, index) => (
                <motion.div 
                  key={log.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="relative pl-8"
                >
                  {/* Timeline Line */}
                  <div className="absolute left-[11px] top-8 bottom-[-32px] w-0.5 bg-slate-200 last:hidden" />
                  
                  {/* Timeline Dot */}
                  <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-[#fafaf9] shadow-sm flex items-center justify-center bg-[#52b788] z-10" />
                  
                  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-4">
                      <span className="font-black text-slate-800 text-base flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                          {log.action_type === 'Siram' && '💧'}
                          {log.action_type === 'Pupuk' && '🌿'}
                          {log.action_type === 'Pangkas' && '✂️'}
                          {log.action_type === 'Hama' && '🐛'}
                          {log.action_type === 'Catatan' && '📓'}
                        </span>
                        {log.action_type}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    
                    {log.notes && (
                      <p className="text-sm font-medium text-slate-600 leading-relaxed mb-4">
                        "{log.notes}"
                      </p>
                    )}

                    {log.photo_url && (
                      <div className="relative h-64 w-full rounded-3xl overflow-hidden shadow-sm border border-slate-100">
                        <Image 
                          src={log.photo_url} 
                          alt="Progress foto" 
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white rounded-[3rem] border-2 border-slate-100 border-dashed">
              <div className="text-5xl mb-4 opacity-50">🌱</div>
              <p className="font-black text-lg text-slate-700 mb-2">Jurnal Masih Kosong</p>
              <p className="text-sm font-medium text-slate-500">Mulai catat perkembangan tanamanmu hari ini.</p>
            </div>
          )}
        </div>
        </div>

        {/* 4. Section Pengingat Perawatan */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pengingat 🔔</h2>
            <button
              onClick={() => setIsReminderModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-agritiva-green/10 text-agritiva-green font-bold text-sm hover:bg-agritiva-green/20 transition-colors"
            >
              <Plus className="w-4 h-4" /> Tambah
            </button>
          </div>

          {reminders.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-slate-100">
              <Bell className="w-8 h-8 mx-auto text-slate-300 mb-3" />
              <p className="font-bold text-slate-500 text-sm">Belum ada pengingat</p>
              <p className="text-xs text-slate-400 mt-1">Tambah jadwal agar tidak lupa merawat tanaman ini</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.map(r => (
                <div key={r.id} className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="text-2xl">
                    {r.activity_type === 'Siram' && '💧'}
                    {r.activity_type === 'Pupuk' && '🌿'}
                    {r.activity_type === 'Pangkas' && '✂️'}
                    {r.activity_type === 'Semprot' && '💨'}
                    {!['Siram','Pupuk','Pangkas','Semprot'].includes(r.activity_type) && '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm">{r.activity_type}</p>
                    <p className="text-xs text-slate-400">
                      Setiap {r.frequency_days} hari · jam {String(r.notification_hour).padStart(2,'0')}:00
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleReminder(r.id, r.is_active)}
                    className={`w-10 h-6 rounded-full transition-colors flex items-center ${r.is_active ? 'bg-agritiva-green justify-end' : 'bg-slate-200 justify-start'}`}
                  >
                    <span className="w-4 h-4 bg-white rounded-full mx-1 shadow-sm" />
                  </button>
                  <button
                    onClick={() => handleDeleteReminder(r.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-red-400 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      {/* 4. Floating Action Bar (FAB) */}
      <div className="fixed bottom-24 left-0 right-0 px-4 md:px-0 pointer-events-none z-40 flex justify-center">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pointer-events-auto bg-white/90 backdrop-blur-xl p-2 rounded-[2.5rem] shadow-2xl border border-white flex gap-2 items-center"
        >
          <button 
            onClick={() => setIsLogModalOpen(true)}
            className="flex items-center gap-2 px-6 py-4 rounded-full bg-gradient-to-r from-agritiva-green to-agritiva-emerald text-white font-black hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            <PlusCircle className="w-5 h-5" /> Jurnal Baru
          </button>
          
          <button 
            onClick={() => setIsStatusModalOpen(true)}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-bold hover:scale-105 active:scale-95 transition-all shadow-sm"
            title="Update Status"
          >
            <Activity className="w-5 h-5" />
          </button>
        </motion.div>
      </div>

      {/* --- MODALS --- */}
      
      {/* Modal: Tambah Jurnal */}
      <Dialog open={isLogModalOpen} onOpenChange={setIsLogModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-0 overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
          <div className="p-6 md:p-8 space-y-6">
            <DialogHeader className="text-left space-y-2">
              <DialogTitle className="text-2xl font-black text-slate-900">Tambah Jurnal</DialogTitle>
              <p className="text-sm font-medium text-slate-500">Catat apa yang kamu lakukan pada {plant.name} hari ini.</p>
            </DialogHeader>

            <form action={(formData) => {
              addPlantLog(formData);
              setIsLogModalOpen(false);
            }} className="space-y-6">
              <input type="hidden" name="plant_id" value={plant.id} />
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tindakan</label>
                <select name="action_type" className="h-14 px-4 w-full rounded-2xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 transition-all appearance-none cursor-pointer">
                  <option value="Siram">💧 Menyiram</option>
                  <option value="Pupuk">🌿 Memberi Pupuk</option>
                  <option value="Pangkas">✂️ Memangkas Daun</option>
                  <option value="Hama">🐛 Mengobati Hama</option>
                  <option value="Catatan">📓 Mencatat Perkembangan</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cerita Singkat</label>
                <textarea name="notes" rows={3} placeholder="Tuliskan perkembangan hari ini..." className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 transition-all placeholder:text-slate-400 resize-none" />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Foto Progress</label>
                <div className="relative">
                  <Input type="file" name="photo" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="h-14 px-4 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-[#40916c] hover:border-[#40916c] transition-colors border-dashed group">
                    <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Upload Foto (Opsional)</span>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full h-14 rounded-full font-black tracking-wide bg-agritiva-green hover:bg-agritiva-emerald text-white shadow-xl hover:-translate-y-1 transition-all active:scale-95">
                Simpan Jurnal
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Update Status */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-0 overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
          <div className="p-6 md:p-8 space-y-6">
            <DialogHeader className="text-left space-y-2">
              <DialogTitle className="text-2xl font-black text-slate-900">Update Kondisi</DialogTitle>
              <p className="text-sm font-medium text-slate-500">Bagaimana keadaan {plant.name} saat ini?</p>
            </DialogHeader>

            <form action={(formData) => {
              const status = formData.get('status') as string;
              updatePlantStatus(plant.id, status);
              setIsStatusModalOpen(false);
            }} className="space-y-6">
              <select name="status" defaultValue={plant.status} className="h-14 px-4 w-full rounded-2xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 transition-all appearance-none cursor-pointer">
                <option value="Sehat">🟢 Sehat & Subur</option>
                <option value="Sakit">🔴 Sedang Sakit / Terserang Hama</option>
                <option value="Kering">🟠 Mulai Mengering</option>
                <option value="Mati">⚫ Mati</option>
                <option value="Panen">🟣 Sudah Dipanen</option>
              </select>
              
              <Button type="submit" className="w-full h-14 rounded-full font-black tracking-wide bg-agritiva-green hover:bg-agritiva-emerald text-white shadow-xl hover:-translate-y-1 transition-all active:scale-95">
                Simpan Status
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
      {/* Modal: Tambah Pengingat */}
      <Dialog open={isReminderModalOpen} onOpenChange={setIsReminderModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-0 overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
          <div className="p-6 md:p-8 space-y-6">
            <DialogHeader className="text-left space-y-2">
              <DialogTitle className="text-2xl font-black text-slate-900">Tambah Pengingat 🔔</DialogTitle>
              <p className="text-sm font-medium text-slate-500">Atur jadwal notifikasi untuk {plant.name}.</p>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jenis Aktivitas</label>
                <select
                  value={newReminder.activity_type}
                  onChange={e => setNewReminder(p => ({ ...p, activity_type: e.target.value }))}
                  className="h-12 px-4 w-full rounded-2xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-agritiva-green focus:ring-4 focus:ring-agritiva-green/10 transition-all appearance-none cursor-pointer"
                >
                  <option value="Siram">💧 Menyiram</option>
                  <option value="Pupuk">🌿 Memberi Pupuk</option>
                  <option value="Pangkas">✂️ Memangkas</option>
                  <option value="Semprot">💨 Menyemprot</option>
                  <option value="Lainnya">📋 Lainnya</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Setiap (hari)</label>
                  <input
                    type="number" min={1} max={30}
                    value={newReminder.frequency_days}
                    onChange={e => setNewReminder(p => ({ ...p, frequency_days: Number(e.target.value) }))}
                    className="h-12 px-4 w-full rounded-2xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-agritiva-green focus:ring-4 focus:ring-agritiva-green/10 transition-all text-center"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jam Notif (WIB)</label>
                  <input
                    type="number" min={0} max={23}
                    value={newReminder.notification_hour}
                    onChange={e => setNewReminder(p => ({ ...p, notification_hour: Number(e.target.value) }))}
                    className="h-12 px-4 w-full rounded-2xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-agritiva-green focus:ring-4 focus:ring-agritiva-green/10 transition-all text-center"
                  />
                </div>
              </div>

              <p className="text-xs text-slate-400 bg-slate-50 rounded-2xl px-4 py-3">
                🔔 Notifikasi akan dikirim ke browser kamu setiap {newReminder.frequency_days} hari sekali pada jam <strong>{String(newReminder.notification_hour).padStart(2,'0')}:00 WIB</strong>.
              </p>

              <Button
                onClick={handleAddReminder}
                disabled={reminderLoading}
                className="w-full h-14 rounded-full font-black tracking-wide bg-agritiva-green hover:bg-agritiva-emerald text-white shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
              >
                {reminderLoading ? 'Menyimpan...' : 'Simpan Pengingat'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
