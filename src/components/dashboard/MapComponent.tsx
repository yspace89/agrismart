"use client";

import { MapContainer, TileLayer, Polygon, Tooltip, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import L from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Trash2, MapPin, Target } from "lucide-react";

interface MapProps {
  mode?: "view" | "draw";
  existingPlots?: any[];
  onSave?: (coords: any) => void;
  onSelectPlot?: (plot: any) => void;
}

function Geoman({ mode, onPolygonCreated }: { mode: "view" | "draw", onPolygonCreated: (coords: any) => void }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (mode === "draw") {
      map.pm.addControls({
        position: "topleft",
        drawMarker: false,
        drawRectangle: true,
        drawPolygon: true,
        removalMode: true,
        editMode: true,
      });

      map.on("pm:create", (e: any) => {
        const layer = e.layer;
        if (layer instanceof L.Polygon) {
          const coords = layer.getLatLngs();
          onPolygonCreated(coords);
        }
      });
    } else {
      map.pm.removeControls();
    }

    return () => {
      map.pm.removeControls();
      map.off("pm:create");
    };
  }, [map, mode, onPolygonCreated]);

  return null;
}

export default function MapComponent({ mode = "view", existingPlots = [], onSave, onSelectPlot }: MapProps) {
  const [newPolygon, setNewPolygon] = useState<any>(null);

  return (
    <div className="w-full h-full relative">
      <style jsx global>{`
        .leaflet-tooltip-pane .custom-tooltip {
          background: rgba(15, 23, 42, 0.9) !important;
          border: 1px solid rgba(16, 185, 129, 0.5) !important;
          border-radius: 8px !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5) !important;
          color: white !important;
          padding: 8px 12px !important;
          font-family: inherit !important;
        }
        .leaflet-tooltip-left:before, .leaflet-tooltip-right:before {
          display: none !important;
        }
        .leaflet-popup-content-wrapper {
          background: #0f172a !important;
          color: white !important;
          border-radius: 12px !important;
          padding: 0 !important;
        }
        .leaflet-popup-tip {
          background: #0f172a !important;
        }
      `}</style>

      <MapContainer 
        center={[-6.8926, 110.8350]} 
        zoom={18} 
        style={{ height: "100%", width: "100%", background: "#0f172a" }}
      >
        <TileLayer
          attribution='&copy; Esri'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        
        {existingPlots.map((plot) => (
          <Polygon 
            key={plot.id}
            positions={plot.location_json?.coords || []}
            eventHandlers={{
              click: () => onSelectPlot && onSelectPlot(plot)
            }}
            pathOptions={{ 
              fillColor: "#10b981", 
              fillOpacity: 0.25, 
              color: "#10b981", 
              weight: 3,
              dashArray: '5, 10'
            }}
          >
            {/* Custom Styled Tooltip */}
            <Tooltip sticky direction="top" className="custom-tooltip">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-emerald-400 text-sm tracking-wide uppercase">{plot.name}</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-400" />
                  <span className="text-[11px] text-white font-medium">Undaan, Kudus, Jawa Tengah</span>
                </div>
              </div>
            </Tooltip>

            {/* Styled Popup */}
            <Popup minWidth={200}>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-sm text-white">{plot.name}</span>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-500 text-[10px]">Active</Badge>
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <span className="text-slate-400">Komoditas:</span>
                  <span className="text-slate-200 font-semibold text-right">Jagung Hibrida</span>
                  <span className="text-slate-400">Health Index:</span>
                  <span className="text-emerald-400 font-bold text-right">98%</span>
                </div>
              </div>
            </Popup>
          </Polygon>
        ))}

        <Geoman mode={mode} onPolygonCreated={setNewPolygon} />
      </MapContainer>

      {mode === "draw" && newPolygon && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex gap-2">
          <Button onClick={() => { onSave?.(newPolygon); setNewPolygon(null); }} className="bg-emerald-600 shadow-2xl">
            <Save className="w-4 h-4 mr-2" /> Konfirmasi Area
          </Button>
          <Button onClick={() => setNewPolygon(null)} variant="destructive" className="shadow-2xl">
            <Trash2 className="w-4 h-4 mr-2" /> Batal
          </Button>
        </div>
      )}
    </div>
  );
}
