"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Leaf, Droplets, FlaskConical, Map as MapIcon, Plus, X, Save, Ruler, Edit2, Send, ClipboardList, User, Sprout, Check, ChevronsUpDown, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendTelegramNotification } from "@/lib/actions";
import { useUserMode } from "@/contexts/UserModeContext";

const MapComponent = dynamic(() => import("@/components/dashboard/MapComponent"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-900 animate-pulse flex items-center justify-center">Loading Maps...</div>
});

export default function LandsPage() {
  const [dbPlots, setDbPlots] = useState<any[]>([]);
  const [dbCommodities, setDbCommodities] = useState<any[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<any>(null);
  const [mode, setMode] = useState<"view" | "draw" | "edit" | "task">("view");
  const [tempCoords, setTempCoords] = useState<any>(null);
  const [tempArea, setTempArea] = useState<number>(0);
  const [openCommodity, setOpenCommodity] = useState(false);
  const { mode: userMode } = useUserMode();
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    pic_name: "",
    pic_telegram_id: "",
    crop: "Jagung",
    budget: "10000000"
  });

  const [taskData, setTaskData] = useState({ title: "", description: "" });
  const [plotTasks, setPlotTasks] = useState<any[]>([]);

  const router = useRouter();

  useEffect(() => {
    fetchPlots();
    fetchCommodities();
  }, [userMode]);

  useEffect(() => {
    if (selectedPlot) {
      fetchTasks(selectedPlot.id);
    } else {
      setPlotTasks([]);
    }
  }, [selectedPlot]);

  const fetchTasks = async (landId: string) => {
    const { data } = await supabase.from('tasks').select('*').eq('land_id', landId).order('due_date', { ascending: true });
    if (data) setPlotTasks(data);
  };

  const fetchCommodities = async () => {
    const { data } = await supabase.from("commodities").select("*");
    if (data) setDbCommodities(data);
  };

  const fetchPlots = async () => {
    const { data } = await supabase.from("lands").select("*, planting_seasons(crop_name)").eq("type", userMode);
    if (data) {
      // Fetch latest sensor logs for each land
      const plotsWithSensors = await Promise.all(data.map(async (plot) => {
        const { data: sensorLog } = await supabase
          .from('sensor_logs')
          .select('*')
          .eq('land_id', plot.id)
          .order('timestamp', { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          ...plot,
          latestSensor: sensorLog || null,
          cropName: plot.planting_seasons?.[0]?.crop_name || "Belum ada komoditas"
        };
      }));

      setDbPlots(plotsWithSensors);
      // Only auto-select for Pro mode
      if (userMode === 'pro' && plotsWithSensors.length > 0 && !selectedPlot) {
        setSelectedPlot(plotsWithSensors[0]);
      }
    }
  }

  const handlePolygonCaptured = (data: any) => {
    // MapComponent now returns { coords, area }
    const coords = data.coords;
    const formattedCoords = Array.isArray(coords[0]) ? coords : coords.map((c: any) => [c.lat, c.lng]);
    setTempCoords(formattedCoords);
    setTempArea(data.area || 0);
  };

  const handleCreateProject = async () => {
    if (!formData.name) return alert("Nama petak wajib diisi!");
    const { data: land, error } = await supabase.from("lands").insert({
      name: formData.name,
      pic_name: formData.pic_name,
      pic_telegram_id: formData.pic_telegram_id,
      area_sqm: tempArea || null,
      location_json: { coords: tempCoords },
      status: "active",
      type: userMode
    }).select().single();

    if (error) return alert("Gagal: " + error.message);

    await supabase.from("planting_seasons").insert({
      land_id: land.id,
      crop_name: formData.crop,
      budget_total: parseFloat(formData.budget),
      status: "ongoing"
    });

    // Auto-generate tasks from roadmap
    if (formData.crop) {
      const { data: roadmaps } = await supabase.from('crop_roadmaps').select('*').eq('commodity_name', formData.crop);
      if (roadmaps && roadmaps.length > 0) {
        const tasksToInsert = roadmaps.map((roadmap: any) => {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + roadmap.day_offset);
          return {
            land_id: land.id,
            title: roadmap.title,
            description: roadmap.description,
            task_type: roadmap.task_type,
            due_date: dueDate.toISOString().split('T')[0],
            status: 'pending'
          };
        });
        await supabase.from('tasks').insert(tasksToInsert);
      }
    }

    resetMode();
  };

  const handleUpdateLand = async () => {
    const { error } = await supabase.from("lands").update({
      name: formData.name,
      pic_name: formData.pic_name,
      pic_telegram_id: formData.pic_telegram_id
    }).eq("id", selectedPlot.id);

    if (!error) {
      alert("✅ Data Lahan Diupdate!");
      resetMode();
    }
  };

  const handleSendTask = async () => {
    if (!taskData.title) return alert("Isi instruksi dulu!");
    
    const { error } = await supabase.from("tasks").insert({
      land_id: selectedPlot.id,
      title: taskData.title,
      description: taskData.description,
      status: "pending"
    });

    if (!error) {
      // Send Real Telegram Notification
      if (selectedPlot.pic_telegram_id) {
        await sendTelegramNotification(
          selectedPlot.pic_telegram_id,
          `🚨 <b>INSTRUKSI BARU DARI PUSAT</b>\n\n<b>Lokasi:</b> ${selectedPlot.name}\n<b>Task:</b> ${taskData.title}\n\n<b>Detail:</b>\n${taskData.description}\n\n<i>Silakan lapor progres via bot ini.</i>`
        );
      }
      
      alert(`🚀 Task terkirim ke PIC ${selectedPlot.pic_name || ''} via Telegram!`);
      resetMode();
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'pending' : 'done';
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
    if (!error) {
      setPlotTasks(plotTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } else {
      alert("Gagal mengupdate task: " + error.message);
    }
  };

  const requestNotifPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        alert("✅ Notifikasi diaktifkan! Anda akan menerima pengingat jadwal kebun.");
        new Notification("Agrinova Urban Farming", { body: "Notifikasi jadwal sudah aktif!" });
      } else {
        alert("❌ Izin notifikasi ditolak/diblokir oleh browser.");
      }
    } else {
      alert("Browser ini tidak mendukung notifikasi push.");
    }
  };

  const resetMode = () => {
    setMode("view");
    setTempCoords(null);
    setTempArea(0);
    setFormData({ name: "", pic_name: "", pic_telegram_id: "", crop: "", budget: "10000000" });
    setTaskData({ title: "", description: "" });
    fetchPlots();
  };

  const displayBudget = new Intl.NumberFormat('id-ID').format(Number(formData.budget) || 0);

  const handleBudgetChange = (e: any) => {
    // Remove non-numeric characters for raw state
    const rawValue = e.target.value.replace(/\D/g, "");
    setFormData({ ...formData, budget: rawValue });
  };

  const filteredCommodities = dbCommodities.filter(c => c.type === userMode || c.type === 'both');

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            {userMode === 'pro' ? "Manajemen Lahan" : "Koleksi Tanaman"}
          </h2>
          <p className="text-slate-400">
            {userMode === 'pro' 
              ? "Command Center: Monitoring, Assign Task & Control PIC." 
              : "Pantau dan catat perkembangan seluruh tanamanmu di sini."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {userMode === 'garden' && (
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800" onClick={requestNotifPermission}>
              <Bell className="w-4 h-4 mr-2" /> Aktifkan Notif
            </Button>
          )}
          <Button 
            onClick={() => {
              setMode(mode === "draw" ? "view" : "draw");
              setSelectedPlot(null);
              if (userMode === 'garden') {
                // Bypass map drawing requirement for garden mode
                setTempCoords([[0,0]]); 
              }
            }}
            className={cn(mode === "draw" ? "bg-slate-700" : "bg-emerald-600 hover:bg-emerald-500")}
          >
            {mode === "draw" ? <><X className="w-4 h-4 mr-2" /> Batal</> : <><Plus className="w-4 h-4 mr-2" /> {userMode === 'pro' ? "Tambah Project Lahan" : "Tambah Tanaman"}</>}
          </Button>
        </div>
      </div>

      <div className={cn("grid gap-6", userMode === 'pro' ? "lg:grid-cols-3" : "grid-cols-1")}>
        
        {userMode === 'pro' && (
          <Card className="lg:col-span-2 bg-slate-900 border-slate-800 shadow-2xl overflow-hidden min-h-[650px] flex flex-col relative">
            <MapComponent 
              mode={mode === "draw" ? "draw" : "view"} 
              existingPlots={dbPlots}
              onSave={handlePolygonCaptured}
              onSelectPlot={(p) => { setSelectedPlot(p); setMode("view"); }}
            />
          </Card>
        )}

        <div className="space-y-6">
          {/* RENDER FORM BASED ON MODE */}
          {mode === "draw" || mode === "edit" ? (
            <Card className="bg-slate-900 border-emerald-500/50 shadow-2xl border-t-4">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">
                  {mode === "draw" ? (userMode === 'pro' ? "Registrasi Lahan" : "Tambah Koleksi Tanaman") : "Edit Data"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">{userMode === 'pro' ? "Nama Petak" : "Nama Tanaman (Misal: Tomat Balkon)"}</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-slate-950 text-white border-slate-800" />
                </div>
                
                {userMode === 'pro' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Nama PIC</Label>
                      <Input value={formData.pic_name} onChange={(e) => setFormData({...formData, pic_name: e.target.value})} className="bg-slate-950 text-white border-slate-800" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Telegram ID PIC</Label>
                      <Input value={formData.pic_telegram_id} onChange={(e) => setFormData({...formData, pic_telegram_id: e.target.value})} className="bg-slate-950 text-white border-slate-800" />
                    </div>
                  </div>
                )}
                {mode === "draw" && (
                  <>
                    {userMode === 'pro' && tempArea > 0 && (
                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                        <Label className="text-slate-400 text-xs">Luas Area Terukur (via Peta)</Label>
                        <p className="text-emerald-500 font-mono font-bold text-lg">{tempArea.toLocaleString('id-ID')} m²</p>
                      </div>
                    )}
                    <div className="space-y-2 flex flex-col">
                      <Label className="text-slate-300">Komoditas / Jenis Tanaman</Label>
                      <Popover open={openCommodity} onOpenChange={setOpenCommodity}>
                        <PopoverTrigger 
                          render={
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between bg-slate-950 text-white border-slate-800"
                            />
                          }
                        >
                          {formData.crop
                              ? filteredCommodities.find((c) => c.name === formData.crop)?.name || formData.crop
                              : "Cari Komoditas..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-slate-900 border-slate-800 text-white z-[9999]">
                          <Command className="bg-slate-900">
                            <CommandInput placeholder="Cari komoditas..." className="text-white" />
                            <CommandList>
                              <CommandEmpty className="py-6 text-center text-sm text-slate-500">
                                {dbCommodities.length === 0 ? "Database kosong. Silakan jalankan SQL." : "Komoditas tidak ditemukan."}
                              </CommandEmpty>
                              <CommandGroup>
                                {filteredCommodities.map((c) => (
                                  <CommandItem
                                    key={c.id}
                                    value={c.name}
                                    onSelect={(currentValue) => {
                                      setFormData({ ...formData, crop: c.name });
                                      setOpenCommodity(false);
                                    }}
                                    className="cursor-pointer text-white data-[selected='true']:bg-slate-800"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        formData.crop === c.name ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {c.name} <span className="text-slate-500 text-xs ml-2">({c.category})</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">{userMode === 'pro' ? "Budget (Rp)" : "Estimasi Modal (Rp)"}</Label>
                      <Input 
                        type="text" 
                        value={displayBudget} 
                        onChange={handleBudgetChange} 
                        className="bg-slate-950 text-white border-slate-800 font-mono" 
                      />
                    </div>
                  </>
                )}
                <Button onClick={mode === "draw" ? handleCreateProject : handleUpdateLand} className="w-full bg-emerald-600 mt-4 text-white" disabled={mode === "draw" && !tempCoords}>
                  <Save className="w-4 h-4 mr-2" /> {mode === "draw" ? "Simpan Data" : "Update Data"}
                </Button>
              </CardContent>
            </Card>
          ) : mode === "task" ? (
            <Card className="bg-slate-900 border-orange-500/50 shadow-2xl border-t-4">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">Assign Task ke {selectedPlot.pic_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Instruksi Utama</Label>
                  <Input placeholder="Misal: Cek Pengairan Blok A" value={taskData.title} onChange={(e) => setTaskData({...taskData, title: e.target.value})} className="bg-slate-950" />
                </div>
                <div className="space-y-2">
                  <Label>Detail Deskripsi</Label>
                  <Textarea placeholder="Detail tindakan yang harus diambil..." value={taskData.description} onChange={(e) => setTaskData({...taskData, description: e.target.value})} className="bg-slate-950 min-h-[100px]" />
                </div>
                <Button onClick={handleSendTask} className="w-full bg-orange-600">
                  <Send className="w-4 h-4 mr-2" /> Kirim Instruksi (Telegram)
                </Button>
                <Button onClick={() => setMode("view")} variant="ghost" className="w-full text-slate-500">Batal</Button>
              </CardContent>
            </Card>
          ) : selectedPlot ? (
            <Card className="bg-slate-900 border-slate-800 shadow-xl border-l-4 border-l-emerald-500">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div>
                  <Button variant="ghost" size="sm" className="mb-2 -ml-3 text-slate-400 hover:text-white" onClick={() => setSelectedPlot(null)}>
                    &larr; Kembali
                  </Button>
                  <CardTitle className="text-xl font-bold text-white">{selectedPlot.name}</CardTitle>
                  <Badge className="mt-2 bg-emerald-500/10 text-emerald-500">{selectedPlot.status}</Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => {
                  setFormData({ name: selectedPlot.name, pic_name: selectedPlot.pic_name || "", pic_telegram_id: selectedPlot.pic_telegram_id || "", crop: "", budget: "" });
                  setMode("edit");
                }}>
                  <Edit2 className="w-4 h-4 text-slate-500" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-emerald-500/10">
                    {userMode === 'pro' ? <User className="w-5 h-5 text-emerald-500" /> : <Sprout className="w-5 h-5 text-emerald-500" />}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">{userMode === 'pro' ? "PIC Lahan" : "Jenis Tanaman"}</p>
                    <p className="text-sm font-bold text-white">{userMode === 'pro' ? (selectedPlot.pic_name || "Belum Ada") : selectedPlot.cropName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <Droplets className={cn("w-5 h-5 mb-1", selectedPlot.latestSensor ? "text-blue-500" : "text-slate-600")} />
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Moisture</p>
                    <p className="text-lg font-bold text-white">
                      {selectedPlot.latestSensor ? `${selectedPlot.latestSensor.value}%` : "No Data"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <FlaskConical className={cn("w-5 h-5 mb-1", selectedPlot.latestSensor ? "text-purple-500" : "text-slate-600")} />
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Soil pH</p>
                    <p className="text-lg font-bold text-white">
                      {selectedPlot.latestSensor ? "6.5" : "No Data"}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-sm font-bold text-slate-300 mb-4">{userMode === 'pro' ? 'Daftar Instruksi' : 'Jadwal & Tugas'}</h4>
                  {plotTasks.length === 0 ? (
                    <p className="text-xs text-slate-500">Belum ada tugas/jadwal terdaftar.</p>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {plotTasks.map(task => (
                        <div key={task.id} className={cn("p-3 border rounded-xl flex gap-3 items-start transition-all", task.status === 'done' ? "bg-slate-900/50 border-slate-800/50 opacity-60" : "bg-slate-950 border-slate-800")}>
                          <button 
                            onClick={() => handleToggleTask(task.id, task.status)}
                            className={cn("mt-0.5 shrink-0 flex items-center justify-center w-5 h-5 rounded border transition-colors", 
                              task.status === 'done' ? "bg-emerald-500 border-emerald-500" : "border-slate-500 hover:border-emerald-400 bg-slate-900"
                            )}>
                            {task.status === 'done' && <Check className="w-3 h-3 text-white" />}
                          </button>
                          <div className="flex-1">
                            <p className={cn("text-sm font-bold", task.status === 'done' ? "text-slate-500 line-through" : "text-slate-200")}>{task.title}</p>
                            {task.description && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{task.description}</p>}
                            {task.due_date && (
                              <p className={cn("text-[10px] mt-2 font-mono w-fit px-2 py-0.5 rounded", task.status === 'done' ? "text-slate-500 bg-slate-800" : "text-orange-400 bg-orange-500/10")}>
                                Jadwal: {task.due_date}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button onClick={() => setMode("task")} className={cn("w-full font-bold", userMode === 'pro' ? "bg-orange-600 hover:bg-orange-500 text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white")}>
                  <ClipboardList className="w-4 h-4 mr-2" /> {userMode === 'pro' ? "Assign Task ke PIC" : "Catat Aktivitas Tambahan"}
                </Button>
              </CardContent>
            </Card>
          ) : userMode === 'garden' ? (
            // GRID VIEW UNTUK GARDEN MODE
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dbPlots.map((plot) => (
                <Card key={plot.id} className="bg-slate-900 border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer" onClick={() => { setSelectedPlot(plot); setMode("view"); }}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-bold text-emerald-400">{plot.name}</CardTitle>
                      <Badge className="bg-slate-800 text-slate-300">{plot.status}</Badge>
                    </div>
                    <p className="text-sm font-medium text-slate-400 mt-1 flex items-center gap-1"><Sprout className="w-3 h-3"/> {plot.cropName}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                      <Droplets className="w-4 h-4 text-blue-400" />
                      <span>{plot.latestSensor ? `${plot.latestSensor.value}% Kelembaban` : "Belum ada sensor"}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {dbPlots.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500">
                  <Sprout className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Belum ada tanaman. Klik "Tambah Tanaman" di pojok kanan atas.</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
