import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Calendar, Cloud, Maximize2, RefreshCw, Loader2, Satellite, MapPin, Activity, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchBestScene, SceneResult, BBox } from '../lib/sentinelImagery';

// Fix Leaflet default icon path issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const TARGETS: Record<string, { bbox: BBox; center: { lat: number; lon: number }; fallback: SceneResult }> = {
  amazon: {
    bbox: [-64.2, 3.2, -63.4, 3.8],
    center: { lat: 3.5, lon: -63.8 },
    fallback: {
      itemId: 'S2B_20NMJ_20260301_0_L2A',
      date: '2026-03-01',
      cloudCover: 19.5,
      thumbnailUrl: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/20/N/MJ/2026/3/S2B_20NMJ_20260301_0_L2A/preview.jpg',
      cogUrl: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/20/N/MJ/2026/3/S2B_20NMJ_20260301_0_L2A/TCI.tif',
      tileUrl: '',
      bounds: [-64.2, 3.2, -63.4, 3.8],
      minZoom: 8,
      maxZoom: 14,
      center: [-63.8, 3.5, 11]
    }
  },
  congo: {
    bbox: [27.0, 1.7, 27.8, 2.5],
    center: { lat: 2.1, lon: 27.4 },
    fallback: {
      itemId: 'S2C_35NMB_20260124_0_L2A',
      date: '2026-01-24',
      cloudCover: 0.5,
      thumbnailUrl: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/35/N/MB/2026/1/S2C_35NMB_20260124_0_L2A/preview.jpg',
      cogUrl: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/35/N/MB/2026/1/S2C_35NMB_20260124_0_L2A/TCI.tif',
      tileUrl: '',
      bounds: [27.0, 1.7, 27.8, 2.5],
      minZoom: 8,
      maxZoom: 14,
      center: [27.4, 2.1, 11]
    }
  },
  borneo: {
    bbox: [110.9, -0.8, 111.5, -0.2],
    center: { lat: -0.5, lon: 111.2 },
    fallback: {
      itemId: 'S2C_49MEV_20250927_0_L2A',
      date: '2025-09-27',
      cloudCover: 16.7,
      thumbnailUrl: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/49/M/EV/2025/9/S2C_49MEV_20250927_0_L2A/preview.jpg',
      cogUrl: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/49/M/EV/2025/9/S2C_49MEV_20250927_0_L2A/TCI.tif',
      tileUrl: '',
      bounds: [110.9, -0.8, 111.5, -0.2],
      minZoom: 8,
      maxZoom: 14,
      center: [111.2, -0.5, 11]
    }
  }
};

const MapController = ({ bounds, center, resetTrigger }: { bounds: BBox, center: [number, number, number], resetTrigger: number }) => {
  const map = useMap();
  
  useEffect(() => {
    if (bounds) {
      const leafletBounds = L.latLngBounds([bounds[1], bounds[0]], [bounds[3], bounds[2]]);
      map.fitBounds(leafletBounds);
    }
  }, [map, bounds]);

  useEffect(() => {
    if (resetTrigger > 0) {
      map.flyTo([center[1], center[0]], center[2]);
    }
  }, [resetTrigger, center, map]);

  return null;
};

const ZoomIndicator = () => {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const onZoom = () => setZoom(map.getZoom());
    map.on('zoomend', onZoom);
    return () => { map.off('zoomend', onZoom); };
  }, [map]);

  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-gray-950/80 backdrop-blur-md border border-white/10 px-2 py-1 rounded text-[10px] font-mono text-gray-400 uppercase tracking-tighter">
      Zoom: {zoom.toFixed(1)}
    </div>
  );
};

interface SentinelViewerProps {
  region: string; // Will map to 'amazon' | 'congo' | 'borneo'
  onSceneLoaded?: (scene: SceneResult) => void;
}

export const SentinelViewer: React.FC<SentinelViewerProps> = ({ region, onSceneLoaded }) => {
  // Normalize region name
  const normalizedRegion = region.toLowerCase().includes('amazon') || region.toLowerCase().includes('yanomami') ? 'amazon' :
                           region.toLowerCase().includes('congo') || region.toLowerCase().includes('orientale') ? 'congo' :
                           region.toLowerCase().includes('borneo') || region.toLowerCase().includes('kalimantan') ? 'borneo' : 'amazon';

  const target = TARGETS[normalizedRegion];
  const [scene, setScene] = useState<SceneResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetTrigger, setResetTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      const result = await fetchBestScene(target.bbox, target.fallback);
      if (isMounted) {
        setScene(result);
        setLoading(false);
        onSceneLoaded?.(result);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [normalizedRegion, target.bbox, target.fallback, onSceneLoaded]);

  const handleReset = () => setResetTrigger(prev => prev + 1);

  return (
    <div className="w-full rounded-xl border border-[#1e2736] overflow-hidden bg-[#0a0e14] flex flex-col shadow-2xl">
      {/* Map Area */}
      <div className="relative h-[420px] w-full overflow-hidden group">
        {/* Scanning Animation (Overlay) */}
        {loading && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-[#22c55e] opacity-60 shadow-[0_0_15px_#22c55e] animate-[scan_2s_linear_infinite]" />
          </div>
        )}

        {/* Crosshair Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
          <div className="relative w-10 h-10">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-red-500/60" />
            <div className="absolute left-1/2 top-0 w-[1px] h-full bg-red-500/60" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500/40 animate-ping" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-red-500" />
          </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2">
          <div className="bg-gray-950/90 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-2 shadow-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Sentinel-2 · LIVE · 10m</span>
          </div>
        </div>

        <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
          <div className="bg-gray-950/90 backdrop-blur-md border border-white/10 px-3 py-1 rounded-lg flex items-center gap-2 shadow-xl">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="text-[10px] font-mono text-gray-300">{scene?.date || 'Searching...'}</span>
          </div>
          <button 
            onClick={handleReset}
            className="p-2 bg-gray-950/90 backdrop-blur-md border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors shadow-xl"
            title="Reset View"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Map or Thumbnail */}
        <div className={cn(
          "absolute inset-0 transition-opacity duration-700",
          (scene && scene.tileUrl) ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          {scene && scene.tileUrl && (
            <MapContainer
              center={[scene.center[1], scene.center[0]]}
              zoom={scene.center[2]}
              zoomControl={false}
              className="h-full w-full"
              minZoom={scene.minZoom}
              maxZoom={scene.maxZoom}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              <TileLayer
                url={scene.tileUrl}
                opacity={1.0}
              />
              <ZoomControl position="bottomright" />
              <ZoomIndicator />
              <MapController bounds={scene.bounds} center={[scene.center[0], scene.center[1], scene.center[2]]} resetTrigger={resetTrigger} />
            </MapContainer>
          )}
        </div>

        {/* Thumbnail Fallback / Loading State */}
        <div className={cn(
          "absolute inset-0 bg-[#0a0e14] flex items-center justify-center transition-opacity duration-700",
          (!scene || !scene.tileUrl) ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          {scene ? (
            <div className="relative w-full h-full">
              <img 
                src={scene.thumbnailUrl} 
                alt="Satellite Preview" 
                className="w-full h-full object-cover opacity-40 grayscale"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                {!scene.tileUrl && !loading && (
                  <div className="bg-amber-500/20 border border-amber-500/30 px-4 py-2 rounded-xl backdrop-blur-md flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2 text-amber-500">
                      <Maximize2 className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-widest">Preview Mode</span>
                    </div>
                    <span className="text-[10px] text-amber-500/70 font-medium uppercase">High-res tiles unavailable</span>
                  </div>
                )}
                {loading && (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] animate-pulse">Establishing Satellite Link...</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-gray-700 animate-spin" />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Initializing Swarm Comms...</span>
            </div>
          )}
        </div>
      </div>

      {/* Metadata Strip */}
      <div className="bg-[#0d1117] border-t border-[#1e2736] p-2 px-4 flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Satellite className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">Sentinel-2 L2A</span>
          </div>
          <div className="h-3 w-px bg-white/5" />
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-[11px] font-mono text-gray-400">{scene?.date || '----/--/--'}</span>
          </div>
          <div className="h-3 w-px bg-white/5" />
          <div className="flex items-center gap-2">
            <Cloud className={cn("w-3.5 h-3.5", (scene?.cloudCover || 0) > 20 ? "text-amber-500" : "text-gray-500")} />
            <span className="text-[11px] font-mono text-gray-400">{scene?.cloudCover.toFixed(1) || '0.0'}% Cloud</span>
          </div>
          <div className="h-3 w-px bg-white/5 hidden md:block" />
          <div className="hidden md:flex items-center gap-2">
            <Maximize2 className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">10m GSD</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-[9px] font-mono text-gray-600 truncate max-w-[120px] hidden lg:block">
            ID: {scene?.itemId || 'Searching...'}
          </div>
          <div className="bg-[#14532d] text-[#86efac] text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
            LIVE
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%   { top: 0% }
          100% { top: 100% }
        }
      `}</style>
    </div>
  );
};
