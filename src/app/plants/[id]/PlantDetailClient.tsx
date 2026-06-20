"use client";

import { useState, useEffect } from 'react';
import { usePushNotification } from '@/hooks/usePushNotification';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { addPlantLog, updatePlantStatus } from '@/lib/garden-actions';
import { updatePlantVitals } from '@/lib/garden-actions';
import Link from 'next/link';
import { Droplet, Sun, Calendar, PlusCircle, MapPin, Activity, ArrowLeft, Camera, X, Bell, BellOff, Trash2, Plus, Pencil, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

export default function PlantDetailClient({ plant, logs }: { plant: any, logs: any[] }) {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isEditVitalsModalOpen, setIsEditVitalsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; isDestructive?: boolean }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // State untuk reminders
  type Reminder = { id: string; activity_type: string; frequency_days: number; notification_hour: number; notification_minute?: number; is_active: boolean; };
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [newReminder, setNewReminder] = useState({ activity_type: 'Siram', frequency_days: 1, notification_hour: 7, notification_minute: 0 });

  const openAddReminderModal = () => {
    setEditingReminderId(null);
    setNewReminder({ activity_type: 'Siram', frequency_days: 1, notification_hour: 7, notification_minute: 0 });
    setIsReminderModalOpen(true);
  };

  const openEditReminderModal = (r: Reminder) => {
    setEditingReminderId(r.id);
    setNewReminder({ 
      activity_type: r.activity_type, 
      frequency_days: r.frequency_days, 
      notification_hour: r.notification_hour, 
      notification_minute: r.notification_minute || 0 
    });
    setIsReminderModalOpen(true);
  };
  // Cari reminder Siram yang sudah ada
  const siramReminder = reminders.find(r => r.activity_type === 'Siram');
  const defaultAutoReminder = !!siramReminder;
  const defaultReminderTime = siramReminder ? `${String(siramReminder.notification_hour).padStart(2, '0')}:${String(siramReminder.notification_minute || 0).padStart(2, '0')}` : '07:00';
  const defaultStartDate = new Date().toLocaleDateString('en-CA'); // format YYYY-MM-DD local time
  const [autoReminderEnabled, setAutoReminderEnabled] = useState(defaultAutoReminder);

  // Sync state ketika data reminders di-load/berubah
  useEffect(() => {
    setAutoReminderEnabled(!!reminders.find(r => r.activity_type === 'Siram'));
  }, [reminders]);

  useEffect(() => {
    fetch(`/api/reminders?plant_id=${plant.id}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setReminders(data); })
      .catch(() => {});
  }, [plant.id]);

  const { permission, isSubscribed, isLoading: pushLoading, subscribe } = usePushNotification();

  const handleSaveReminderClick = () => {
    if (editingReminderId) {
      setConfirmDialog({
        isOpen: true,
        title: 'Simpan Perubahan',
        message: 'Apakah kamu yakin ingin menyimpan perubahan pengingat ini?',
        onConfirm: submitReminder
      });
    } else {
      submitReminder();
    }
  };

  const submitReminder = async () => {
    setReminderLoading(true);
    try {
      const method = editingReminderId ? 'PATCH' : 'POST';
      const url = editingReminderId ? `/api/reminders?id=${editingReminderId}` : '/api/reminders';
      const payload = editingReminderId ? newReminder : { plant_id: plant.id, ...newReminder };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        if (editingReminderId) {
          setReminders(prev => prev.map(r => r.id === editingReminderId ? data : r));
        } else {
          setReminders(prev => [data, ...prev]);
        }
        setIsReminderModalOpen(false);
        setConfirmDialog(p => ({ ...p, isOpen: false }));
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

  const handleDeleteReminder = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Pengingat',
      message: 'Apakah kamu yakin ingin menghapus pengingat ini?',
      isDestructive: true,
      onConfirm: async () => {
        const res = await fetch(`/api/reminders?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          setReminders(prev => prev.filter(r => r.id !== id));
        }
        setConfirmDialog(p => ({ ...p, isOpen: false }));
      }
    });
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
    <div className="min-h-screen bg-[#fafaf9] pb-24 -mx-4 md:-mx-8 -mt-6">
      {/* 1. Header (Clean) */}
      <div className="pt-6 px-4 md:px-6 flex items-center justify-between">
        <Link href="/plants">
          <Button variant="ghost" className="rounded-full w-10 h-10 p-0 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <button 
          onClick={() => setIsStatusModalOpen(true)}
          className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest border transition-all ${getStatusStyle(plant.status)}`}
        >
          {plant.status}
        </button>
      </div>

      {/* 2. Main Content Wrapper */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-6 space-y-8">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">{plant.name}</h1>
          <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">{plant.type} {plant.species ? `• ${plant.species}` : ''}</p>
        </div>

        {/* Photo if exists */}
        {plant.photo_url && (
          <div className="relative w-full h-48 md:h-64 rounded-3xl overflow-hidden shadow-sm border border-slate-100">
            <Image 
              src={plant.photo_url} 
              alt={plant.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Plant Vitals (Grid) */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <button 
            onClick={() => setIsEditVitalsModalOpen(true)}
            className="relative bg-white rounded-[1.25rem] p-3 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-1.5 hover:border-cyan-200 hover:shadow-md transition-all group"
          >
            <Pencil className="absolute top-2 right-2 w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Droplet className="w-5 h-5 text-cyan-500 mb-0.5 group-hover:scale-110 transition-transform" />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Siram</p>
            <p className="text-xs font-bold text-slate-800 leading-tight">Tiap {plant.water_frequency_days} Hari</p>
          </button>
          
          <button 
            onClick={() => setIsEditVitalsModalOpen(true)}
            className="relative bg-white rounded-[1.25rem] p-3 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-1.5 hover:border-amber-200 hover:shadow-md transition-all group"
          >
            <Pencil className="absolute top-2 right-2 w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Sun className="w-5 h-5 text-amber-500 mb-0.5 group-hover:scale-110 transition-transform" />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cahaya</p>
            <p className="text-xs font-bold text-slate-800 leading-tight w-full px-1 truncate" title={plant.light_requirement || '-'}>
              {plant.light_requirement || '-'}
            </p>
          </button>

          <button 
            onClick={() => setIsEditVitalsModalOpen(true)}
            className="relative bg-white rounded-[1.25rem] p-3 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-1.5 hover:border-purple-200 hover:shadow-md transition-all group"
          >
            <Pencil className="absolute top-2 right-2 w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Calendar className="w-5 h-5 text-purple-500 mb-0.5 group-hover:scale-110 transition-transform" />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ditanam</p>
            <p className="text-xs font-bold text-slate-800 leading-tight">
              {new Date(plant.planted_date || plant.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </p>
          </button>
        </div>

        {plant.notes && (
          <div className="bg-orange-50/50 p-5 rounded-3xl border border-orange-100/50">
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1.5">Catatan</p>
            <p className="text-sm font-medium text-slate-700 leading-relaxed">{plant.notes}</p>
          </div>
        )}

        {/* 3. Section Pengingat Perawatan */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Bell className="w-4 h-4 text-agritiva-green" /> Pengingat
            </h2>
            <button
              onClick={openAddReminderModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah
            </button>
          </div>

          {/* Banner Aktifkan Notifikasi — muncul jika belum subscribe */}
          {!isSubscribed && permission !== 'denied' && (
            <button
              onClick={subscribe}
              disabled={pushLoading}
              className="w-full flex items-center gap-3 bg-gradient-to-r from-agritiva-green/10 to-emerald-50 border border-agritiva-green/20 rounded-2xl px-4 py-3 text-left hover:from-agritiva-green/20 transition-all group"
            >
              <span className="text-2xl">🔔</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-agritiva-green">
                  {pushLoading ? 'Mengaktifkan...' : 'Aktifkan Notifikasi Pengingat'}
                </p>
                <p className="text-[11px] font-medium text-slate-500">Izinkan browser mengirim notifikasi ke perangkat kamu</p>
              </div>
              <span className="text-agritiva-green opacity-60 group-hover:opacity-100 transition-opacity">›</span>
            </button>
          )}
          {permission === 'denied' && (
            <div className="w-full flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
              <span className="text-xl">🔕</span>
              <p className="text-xs font-medium text-red-500">Notifikasi diblokir di browser. Buka <strong>Pengaturan Situs</strong> untuk mengizinkannya.</p>
            </div>
          )}
          {isSubscribed && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-2xl border border-green-100 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-agritiva-green animate-pulse" />
              <p className="text-[11px] font-bold text-agritiva-green">Notifikasi aktif di perangkat ini</p>
            </div>
          )}

          {reminders.length === 0 ? (
            <div className="text-center py-6 bg-white rounded-3xl border border-dashed border-slate-200">
              <BellOff className="w-5 h-5 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-400 text-xs">Belum ada jadwal pengingat</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {reminders.map(r => (
                <div key={r.id} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg shadow-inner shrink-0">
                    {r.activity_type === 'Siram' && '💧'}
                    {r.activity_type === 'Pupuk' && '🌿'}
                    {r.activity_type === 'Pangkas' && '✂️'}
                    {r.activity_type === 'Semprot' && '💨'}
                    {!['Siram','Pupuk','Pangkas','Semprot'].includes(r.activity_type) && '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm">{r.activity_type}</p>
                    <p className="text-[11px] font-medium text-slate-400 truncate">
                      Tiap {r.frequency_days} hari • {String(r.notification_hour).padStart(2,'0')}:{String(r.notification_minute || 0).padStart(2,'0')} WIB
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleReminder(r.id, r.is_active)}
                    className={`w-9 h-5 rounded-full transition-all flex items-center shrink-0 ${r.is_active ? 'bg-agritiva-green justify-end' : 'bg-slate-200 justify-start'}`}
                  >
                    <span className="w-3.5 h-3.5 bg-white rounded-full mx-1 shadow-sm" />
                  </button>
                  <button
                    onClick={() => openEditReminderModal(r)}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-agritiva-green hover:bg-green-50 transition-colors shrink-0"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteReminder(r.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Story-like Timeline (Riwayat) */}
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Jurnal Perawatan</h2>
            <button 
              onClick={() => setIsLogModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-sm active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Jurnal Baru
            </button>
          </div>
          
          {logs && logs.length > 0 ? (
            <div className="space-y-6">
              {logs.map((log, index) => (
                <motion.div 
                  key={log.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="relative pl-6"
                >
                  {/* Timeline Line */}
                  <div className="absolute left-[3px] top-6 bottom-[-24px] w-[2px] bg-slate-100 last:hidden" />
                  
                  {/* Timeline Dot */}
                  <div className="absolute left-[-2.5px] top-2 w-3.5 h-3.5 rounded-full bg-slate-300 ring-4 ring-[#fafaf9] z-10" />
                  
                  <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex justify-between items-start mb-2.5">
                      <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-sm shadow-sm border border-slate-100">
                          {log.action_type === 'Siram' && '💧'}
                          {log.action_type === 'Pupuk' && '🌿'}
                          {log.action_type === 'Pangkas' && '✂️'}
                          {log.action_type === 'Hama' && '🐛'}
                          {log.action_type === 'Catatan' && '📓'}
                        </span>
                        {log.action_type}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 text-right">
                        {new Date(log.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })} <br/>
                        <span className="text-slate-300 font-bold">{new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                      </span>
                    </div>
                    
                    {log.notes && (
                      <p className="text-xs font-medium text-slate-600 leading-relaxed mb-3">
                        "{log.notes}"
                      </p>
                    )}

                    {log.photo_url && (
                      <button 
                        onClick={() => setPreviewImage(log.photo_url)}
                        className="relative h-24 w-24 md:h-32 md:w-32 rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-agritiva-green"
                      >
                        <Image 
                          src={log.photo_url} 
                          alt="Progress foto" 
                          fill
                          className="object-cover"
                        />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 px-4 bg-white rounded-3xl border border-slate-200 border-dashed">
              <div className="text-4xl mb-3 opacity-40">🌱</div>
              <p className="font-black text-sm text-slate-600 mb-1">Jurnal Masih Kosong</p>
              <p className="text-xs font-medium text-slate-400">Mulai catat perkembangan tanamanmu.</p>
            </div>
          )}
        </div>
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
              <DialogTitle className="text-2xl font-black text-slate-900">
                {editingReminderId ? 'Edit Pengingat ✏️' : 'Tambah Pengingat 🔔'}
              </DialogTitle>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diulang Setiap</label>
                  <select
                    value={newReminder.frequency_days}
                    onChange={e => setNewReminder(p => ({ ...p, frequency_days: Number(e.target.value) }))}
                    className="h-12 px-4 w-full rounded-2xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-agritiva-green focus:ring-4 focus:ring-agritiva-green/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value={1}>Setiap Hari</option>
                    <option value={2}>Setiap 2 Hari</option>
                    <option value={3}>Setiap 3 Hari</option>
                    <option value={7}>Setiap 1 Minggu</option>
                    <option value={14}>Setiap 2 Minggu</option>
                    <option value={30}>Setiap 1 Bulan</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu Dikirim</label>
                  <input
                    type="time"
                    value={`${String(newReminder.notification_hour).padStart(2, '0')}:${String(newReminder.notification_minute).padStart(2, '0')}`}
                    onChange={e => {
                      if (e.target.value) {
                        const [hourStr, minStr] = e.target.value.split(':');
                        setNewReminder(p => ({ 
                          ...p, 
                          notification_hour: parseInt(hourStr, 10),
                          notification_minute: parseInt(minStr, 10)
                        }));
                      }
                    }}
                    className="h-12 px-4 w-full rounded-2xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-agritiva-green focus:ring-4 focus:ring-agritiva-green/10 transition-all text-center cursor-pointer"
                  />
                </div>
              </div>

              <p className="text-xs text-slate-400 bg-slate-50 rounded-2xl px-4 py-3">
                🔔 Notifikasi akan dikirim ke browser kamu setiap {newReminder.frequency_days} hari sekali pada jam <strong>{String(newReminder.notification_hour).padStart(2,'0')}:{String(newReminder.notification_minute).padStart(2,'0')} WIB</strong>.
              </p>

              <Button
                onClick={handleSaveReminderClick}
                disabled={reminderLoading}
                className="w-full h-14 rounded-full font-black tracking-wide bg-agritiva-green hover:bg-agritiva-emerald text-white shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
              >
                {reminderLoading ? 'Menyimpan...' : 'Simpan Pengingat'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Preview Gambar Besar */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="sm:max-w-2xl bg-transparent border-0 shadow-none p-0 overflow-hidden flex flex-col items-center justify-center">
          {previewImage && (
            <div className="relative w-full max-w-lg aspect-[3/4] md:aspect-square bg-black/50 rounded-3xl overflow-hidden backdrop-blur-sm">
              <Image 
                src={previewImage} 
                alt="Foto Jurnal Besar" 
                fill
                className="object-contain"
              />
              <button 
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Edit Vitals */}
      <Dialog open={isEditVitalsModalOpen} onOpenChange={setIsEditVitalsModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-0 overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
          <div className="p-6 md:p-8 space-y-6">
            <DialogHeader className="text-left space-y-2">
              <DialogTitle className="text-2xl font-black text-slate-900">Edit Info Tanaman</DialogTitle>
              <p className="text-sm font-medium text-slate-500">Sesuaikan jadwal perawatan {plant.name}.</p>
            </DialogHeader>

            <form action={(formData) => {
              setConfirmDialog({
                isOpen: true,
                title: 'Simpan Perubahan',
                message: 'Apakah kamu yakin ingin menyimpan perubahan info tanaman ini?',
                onConfirm: async () => {
                  const waterFrequency = parseInt(formData.get('water_frequency_days') as string, 10);
                  const lightReq = formData.get('light_requirement') as string;
                  const plantedDate = formData.get('planted_date') as string;
                  
                  let reminderData: { enabled: boolean; hour?: number; minute?: number; next_send_at?: string } = { enabled: false };
                  if (autoReminderEnabled) {
                    const timeStr = formData.get('reminder_time') as string;
                    const startDateStr = formData.get('reminder_start_date') as string;
                    if (timeStr) {
                      const [h, m] = timeStr.split(':');
                      let nextSendAtStr = undefined;
                      if (startDateStr) {
                        // Gabungkan tanggal mulai dan jam menjadi local date string lalu ke ISO untuk PostgreSQL
                        const localDate = new Date(`${startDateStr}T${timeStr}:00+07:00`);
                        nextSendAtStr = localDate.toISOString();
                      }
                      reminderData = { 
                        enabled: true, 
                        hour: parseInt(h, 10), 
                        minute: parseInt(m, 10),
                        next_send_at: nextSendAtStr 
                      };
                    }
                  }
                  
                  await updatePlantVitals(plant.id, waterFrequency, lightReq, plantedDate, reminderData);
                  
                  // Reload reminders to reflect the backend changes immediately
                  fetch(`/api/reminders?plant_id=${plant.id}`)
                    .then(res => res.json())
                    .then(data => setReminders(data.data || []));

                  setIsEditVitalsModalOpen(false);
                  setConfirmDialog(p => ({ ...p, isOpen: false }));
                }
              });
            }} className="space-y-6">
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disiram Setiap Berapa Hari?</label>
                <input 
                  type="number" 
                  name="water_frequency_days" 
                  defaultValue={plant.water_frequency_days}
                  min="1"
                  className="h-14 px-4 w-full rounded-2xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 transition-all"
                  required
                />
              </div>

              {/* UX Auto Reminder Toggle */}
              <div className="bg-green-50/50 p-4 rounded-[1.25rem] border border-green-100/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-800">Pengingat Siram Otomatis</p>
                    <p className="text-xs font-medium text-slate-500">Buat jadwal notifikasi sesuai frekuensi</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setAutoReminderEnabled(!autoReminderEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoReminderEnabled ? 'bg-agritiva-green' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoReminderEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                
                {autoReminderEnabled && (
                  <div className="pt-2 border-t border-green-100 flex gap-4">
                    <div className="flex-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Mulai Kapan?</label>
                      <input 
                        type="date" 
                        name="reminder_start_date" 
                        defaultValue={defaultStartDate}
                        className="h-12 px-4 w-full rounded-2xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-agritiva-green focus:ring-4 focus:ring-agritiva-green/10 transition-all text-center cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Jam</label>
                      <input 
                        type="time" 
                        name="reminder_time" 
                        defaultValue={defaultReminderTime}
                        className="h-12 px-4 w-full rounded-2xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-agritiva-green focus:ring-4 focus:ring-agritiva-green/10 transition-all text-center cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kebutuhan Cahaya</label>
                <select 
                  name="light_requirement" 
                  defaultValue={plant.light_requirement || 'Teduh'}
                  className="h-14 px-4 w-full rounded-2xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 transition-all appearance-none cursor-pointer"
                >
                  <option value="Teduh">Teduh (Low Light)</option>
                  <option value="Sedang">Sedang (Partial Sun)</option>
                  <option value="Panas">Panas (Full Sun)</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal Ditanam</label>
                <input 
                  type="date" 
                  name="planted_date" 
                  defaultValue={plant.planted_date ? new Date(plant.planted_date).toISOString().split('T')[0] : ''}
                  className="h-14 px-4 w-full rounded-2xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-[#40916c] focus:ring-4 focus:ring-[#40916c]/10 transition-all"
                />
              </div>

              <Button type="submit" className="w-full h-14 rounded-full font-black tracking-wide bg-agritiva-green hover:bg-agritiva-emerald text-white shadow-xl hover:-translate-y-1 transition-all active:scale-95">
                Simpan Perubahan
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Global Confirmation Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => !open && setConfirmDialog(p => ({ ...p, isOpen: false }))}>
        <DialogContent className="sm:max-w-[400px] rounded-[2rem] p-0 overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
          <div className="p-6 md:p-8 space-y-6 text-center">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${confirmDialog.isDestructive ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-2">{confirmDialog.title}</h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">{confirmDialog.message}</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setConfirmDialog(p => ({ ...p, isOpen: false }))}
                className="flex-1 h-12 rounded-full font-bold border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Batal
              </Button>
              <Button 
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm();
                }}
                className={`flex-1 h-12 rounded-full font-bold text-white shadow-md ${confirmDialog.isDestructive ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-agritiva-green hover:bg-agritiva-emerald shadow-agritiva-green/20'}`}
              >
                Ya, Lanjutkan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
