import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Calendar, Cloud, Maximize2, RefreshCw, Loader2, Satellite, MapPin, Activity, ShieldAlert, Eye, Layers } from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchBestScene, SceneResult, BBox, TARGETS, TargetConfig } from '../lib/sentinelImagery';

// Fix Leaflet default icon path issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const TITILER = 'https://titiler.xyz';
const SWIR_PARAMS = 'assets=swir16&assets=nir&assets=red&asset_as_band=true&rescale=0,3000';
const TCI_PARAMS  = 'assets=visual&rescale=0,3000';

const swirTileUrl = (itemUrl: string) =>
  `${TITILER}/stac/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=${encodeURIComponent(itemUrl)}&${SWIR_PARAMS}`;

const tciTileUrl = (itemUrl: string) =>
  `${TITILER}/stac/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=${encodeURIComponent(itemUrl)}&${TCI_PARAMS}`;

const FlyToMine = ({ lat, lon, zoom }: { lat: number; lon: number; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], zoom, { duration: 1.5 });
  }, [lat, lon, zoom, map]);
  return null;
};

const ZoomPresets = ({ target }: { target: TargetConfig }) => {
  const map = useMap();
  return (
    <div className="absolute top-2 right-11 z-[1000] flex flex-col gap-1">
      {[
        { label: 'REGION',  zoom: 10 },
        { label: 'SITE',    zoom: 12 },
        { label: 'PIT',     zoom: 14 },
      ].map(({ label, zoom }) => (
        <button 
          key={zoom} 
          onClick={() => map.flyTo([target.focusLat, target.focusLon], zoom, { duration: 0.8 })}
          className={cn(
            "bg-[#0d1117] border border-[#1e2736] text-[9px] font-medium px-2 py-1 rounded cursor-pointer tracking-widest font-mono transition-colors",
            zoom === 14 ? "text-red-500 hover:bg-red-500/10" : "text-gray-400 hover:text-white hover:bg-white/5"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
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
  region: string;
  onSceneLoaded?: (scene: SceneResult) => void;
}

export const SentinelViewer: React.FC<SentinelViewerProps> = ({ region, onSceneLoaded }) => {
  const normalizedRegion = region.toLowerCase().includes('amazon') || region.toLowerCase().includes('yanomami') || region.toLowerCase().includes('peru') ? 'amazon' :
                           region.toLowerCase().includes('congo') || region.toLowerCase().includes('orientale') ? 'congo' :
                           region.toLowerCase().includes('borneo') || region.toLowerCase().includes('kalimantan') ? 'borneo' : 'amazon';

  const target = TARGETS[normalizedRegion];
  const [scene, setScene] = useState<SceneResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [layer, setLayer] = useState<'swir' | 'tci'>('swir');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      const result = await fetchBestScene(target.bounds, target);
      if (isMounted) {
        setScene(result);
        setLoading(false);
        onSceneLoaded?.(result);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [normalizedRegion, target, onSceneLoaded]);

  const handleReset = () => setResetTrigger(prev => prev + 1);

  const activeTileUrl = scene ? (layer === 'swir' ? swirTileUrl(scene.itemUrl) : tciTileUrl(scene.itemUrl)) : '';

  return (
    <div className="w-full rounded-xl border border-[#1e2736] overflow-hidden bg-[#0a0e14] flex flex-col shadow-2xl">
      {/* Layer Toggle Header */}
      <div className="bg-[#0d1117] border-b border-[#1e2736] p-2 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-primary" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Imaging Mode</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setLayer('swir')}
            className={cn(
              "text-[9px] font-black px-3 py-1 rounded border transition-all uppercase tracking-widest",
              layer === 'swir' 
                ? "bg-red-500 text-white border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]" 
                : "bg-transparent text-gray-500 border-[#1e2736] hover:text-gray-300"
            )}
          >
            Mining Detection
          </button>
          <button
            onClick={() => setLayer('tci')}
            className={cn(
              "text-[9px] font-black px-3 py-1 rounded border transition-all uppercase tracking-widest",
              layer === 'tci' 
                ? "bg-red-500 text-white border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]" 
                : "bg-transparent text-gray-500 border-[#1e2736] hover:text-gray-300"
            )}
          >
            True Colour
          </button>
        </div>
      </div>

      {/* Map Area */}
      <div className="relative h-[420px] w-full overflow-hidden group">
        {/* Scanning Animation */}
        {loading && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-[#22c55e] opacity-60 shadow-[0_0_15px_#22c55e] animate-[scan_2s_linear_infinite]" />
          </div>
        )}

        {/* Crosshair */}
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
          <div className="relative w-10 h-10">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-red-500/60" />
            <div className="absolute left-1/2 top-0 w-[1px] h-full bg-red-500/60" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-red-500" />
          </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2">
          <div className="bg-gray-950/90 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-2 shadow-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              {layer === 'swir' ? 'SWIR SENSOR' : 'VISUAL SENSOR'} · 10m
            </span>
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
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Map Container */}
        <div className={cn(
          "absolute inset-0 transition-opacity duration-700",
          (scene && activeTileUrl) ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          {scene && activeTileUrl && (
            <MapContainer
              center={[target.focusLat, target.focusLon]}
              zoom={target.defaultZoom}
              zoomControl={false}
              className="h-full w-full"
              minZoom={8}
              maxZoom={18}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap &copy; CARTO'
              />
              <TileLayer
                key={`${scene.itemId}-${layer}`}
                url={activeTileUrl}
                minZoom={8}
                maxNativeZoom={14}
                maxZoom={18}
                tileSize={256}
                attribution="Sentinel-2 L2A · ESA · Element84 · TiTiler"
                opacity={1.0}
              />
              <ZoomControl position="bottomright" />
              <ZoomIndicator />
              <FlyToMine
                lat={target.focusLat}
                lon={target.focusLon}
                zoom={target.defaultZoom}
              />
              <ZoomPresets target={target} />
              <MapController bounds={scene.bounds} center={[scene.center[0], scene.center[1], scene.center[2]]} resetTrigger={resetTrigger} />
            </MapContainer>
          )}
        </div>

        {/* Fallback/Loading */}
        <div className={cn(
          "absolute inset-0 bg-[#0a0e14] flex items-center justify-center transition-opacity duration-700",
          (!scene || !activeTileUrl) ? "opacity-100" : "opacity-0 pointer-events-none"
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
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
              {layer === 'swir' ? 'SWIR FALSE COLOUR · B11/B08/B04' : 'TRUE COLOUR · RGB'}
            </span>
          </div>
          <div className="h-3 w-px bg-white/5" />
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-brand-primary" />
            <span className="text-[11px] font-black text-brand-primary uppercase tracking-widest">
              {layer === 'swir' ? 'MINING DETECTION MODE' : 'NATURAL COLOUR'}
            </span>
          </div>
          <div className="h-3 w-px bg-white/5 hidden md:block" />
          <div className="hidden md:flex items-center gap-2">
            <Cloud className={cn("w-3.5 h-3.5", (scene?.cloudCover || 0) > 20 ? "text-amber-500" : "text-gray-500")} />
            <span className="text-[11px] font-mono text-gray-400">{scene?.cloudCover.toFixed(1) || '0.0'}% Cloud</span>
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
