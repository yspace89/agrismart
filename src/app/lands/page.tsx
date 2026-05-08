"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Droplets, FlaskConical, Map as MapIcon, Plus, X, Save, Ruler, Edit2, Send, ClipboardList, User } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendTelegramNotification } from "@/lib/actions";

const MapComponent = dynamic(() => import("@/components/dashboard/MapComponent"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-900 animate-pulse flex items-center justify-center">Loading Maps...</div>
});

export default function LandsPage() {
  const [dbPlots, setDbPlots] = useState<any[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<any>(null);
  const [mode, setMode] = useState<"view" | "draw" | "edit" | "task">("view");
  const [tempCoords, setTempCoords] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    pic_name: "",
    pic_telegram_id: "",
    crop: "Jagung",
    budget: "10000000"
  });

  const [taskData, setTaskData] = useState({ title: "", description: "" });

  const router = useRouter();

  useEffect(() => {
    fetchPlots();
  }, []);

  async function fetchPlots() {
    const { data } = await supabase.from("lands").select("*");
    if (data) {
      setDbPlots(data);
      if (data.length > 0 && !selectedPlot) setSelectedPlot(data[0]);
    }
  }

  const handlePolygonCaptured = (coords: any) => {
    const formattedCoords = Array.isArray(coords[0]) ? coords : (coords as any).map((c: any) => [c.lat, c.lng]);
    setTempCoords(formattedCoords);
  };

  const handleCreateProject = async () => {
    if (!formData.name) return alert("Nama petak wajib diisi!");
    const { data: land, error } = await supabase.from("lands").insert({
      name: formData.name,
      pic_name: formData.pic_name,
      pic_telegram_id: formData.pic_telegram_id,
      location_json: { coords: tempCoords },
      status: "active"
    }).select().single();

    if (error) return alert("Gagal: " + error.message);

    await supabase.from("planting_seasons").insert({
      land_id: land.id,
      crop_name: formData.crop,
      budget_total: parseFloat(formData.budget),
      status: "ongoing"
    });

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

  const resetMode = () => {
    setMode("view");
    setTempCoords(null);
    setFormData({ name: "", pic_name: "", pic_telegram_id: "", crop: "Jagung", budget: "10000000" });
    setTaskData({ title: "", description: "" });
    fetchPlots();
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Manajemen Lahan</h2>
          <p className="text-slate-400">Command Center: Monitoring, Assign Task & Control PIC.</p>
        </div>
        <Button 
          onClick={() => setMode(mode === "draw" ? "view" : "draw")}
          className={cn(mode === "draw" ? "bg-slate-700" : "bg-emerald-600 hover:bg-emerald-500")}
        >
          {mode === "draw" ? <><X className="w-4 h-4 mr-2" /> Batal</> : <><Plus className="w-4 h-4 mr-2" /> Tambah Project Lahan</>}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-slate-900 border-slate-800 shadow-2xl overflow-hidden min-h-[650px] flex flex-col relative">
          <MapComponent 
            mode={mode === "draw" ? "draw" : "view"} 
            existingPlots={dbPlots}
            onSave={handlePolygonCaptured}
            onSelectPlot={(p) => { setSelectedPlot(p); setMode("view"); }}
          />
        </Card>

        <div className="space-y-6">
          {/* RENDER FORM BASED ON MODE */}
          {mode === "draw" || mode === "edit" ? (
            <Card className="bg-slate-900 border-emerald-500/50 shadow-2xl border-t-4">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">{mode === "draw" ? "Registrasi Lahan" : "Edit Data Lahan"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama Petak</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-slate-950" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Nama PIC</Label>
                    <Input value={formData.pic_name} onChange={(e) => setFormData({...formData, pic_name: e.target.value})} className="bg-slate-950" />
                  </div>
                  <div className="space-y-2">
                    <Label>Telegram ID PIC</Label>
                    <Input value={formData.pic_telegram_id} onChange={(e) => setFormData({...formData, pic_telegram_id: e.target.value})} className="bg-slate-950" />
                  </div>
                </div>
                {mode === "draw" && (
                  <>
                    <div className="space-y-2">
                      <Label>Komoditas</Label>
                      <Input value={formData.crop} onChange={(e) => setFormData({...formData, crop: e.target.value})} className="bg-slate-950" />
                    </div>
                    <div className="space-y-2">
                      <Label>Budget (Rp)</Label>
                      <Input type="number" value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} className="bg-slate-950" />
                    </div>
                  </>
                )}
                <Button onClick={mode === "draw" ? handleCreateProject : handleUpdateLand} className="w-full bg-emerald-600 mt-4" disabled={mode === "draw" && !tempCoords}>
                  <Save className="w-4 h-4 mr-2" /> {mode === "draw" ? "Simpan Project" : "Update Lahan"}
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-xl font-bold text-white">{selectedPlot.name}</CardTitle>
                  <Badge className="mt-1 bg-emerald-500/10 text-emerald-500">{selectedPlot.status}</Badge>
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
                    <User className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">PIC Lahan</p>
                    <p className="text-sm font-bold text-white">{selectedPlot.pic_name || "Belum Ada"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <Droplets className="w-5 h-5 text-blue-500 mb-1" />
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Moisture</p>
                    <p className="text-lg font-bold text-white">68%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <FlaskConical className="w-5 h-5 text-purple-500 mb-1" />
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Soil pH</p>
                    <p className="text-lg font-bold text-white">6.5</p>
                  </div>
                </div>
                <Button onClick={() => setMode("task")} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold">
                  <ClipboardList className="w-4 h-4 mr-2" /> Assign Task ke PIC
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
