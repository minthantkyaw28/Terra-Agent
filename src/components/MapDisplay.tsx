import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapOverlay } from '../lib/demoSimulation';

interface MapDisplayProps {
  overlays: MapOverlay[];
  selectedFindingCoords?: [number, number];
}

// Component to handle map view changes
function MapController({ center }: { center?: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 10, { duration: 2.5 });
    }
  }, [center, map]);
  return null;
}

export const MapDisplay: React.FC<MapDisplayProps> = ({ overlays, selectedFindingCoords }) => {
  const getOverlayColor = (status: MapOverlay['status']) => {
    switch (status) {
      case 'scanning': return '#00f2ff'; // Teal
      case 'candidate': return '#fbbf24'; // Yellow
      case 'analyzing': return '#f97316'; // Orange
      case 'confirmed': return '#ef4444'; // Red
      default: return '#00f2ff';
    }
  };

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-gray-950">
      <MapContainer 
        center={[15, 0]} 
        zoom={2} 
        className="w-full h-full bg-gray-950"
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <MapController center={selectedFindingCoords} />

        {overlays.map((overlay) => (
          <React.Fragment key={overlay.id}>
            <Circle
              center={overlay.coords}
              radius={overlay.status === 'confirmed' ? 15000 : 80000}
              pathOptions={{
                color: getOverlayColor(overlay.status),
                fillColor: getOverlayColor(overlay.status),
                fillOpacity: overlay.status === 'confirmed' ? 0.3 : 0.1,
                weight: 2,
                dashArray: overlay.status === 'scanning' ? '5, 10' : undefined,
                className: overlay.status === 'confirmed' ? 'animate-pulse' : 'animate-pulse opacity-50'
              }}
            >
              <Popup className="custom-popup">
                <div className="p-2 font-mono text-[10px] bg-gray-900 text-white rounded border border-white/10">
                  <div className="font-bold uppercase mb-1 border-b border-white/10 pb-1">{overlay.label}</div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">STATUS:</span>
                    <span className="text-brand-primary font-bold">{overlay.status.toUpperCase()}</span>
                  </div>
                </div>
              </Popup>
            </Circle>

            {overlay.status === 'confirmed' && (
              <Polygon 
                positions={[
                  [overlay.coords[0] + 0.05, overlay.coords[1] - 0.05],
                  [overlay.coords[0] + 0.05, overlay.coords[1] + 0.05],
                  [overlay.coords[0] - 0.05, overlay.coords[1] + 0.05],
                  [overlay.coords[0] - 0.05, overlay.coords[1] - 0.05],
                ]}
                pathOptions={{
                  color: '#ef4444',
                  fillColor: '#ef4444',
                  fillOpacity: 0.4,
                  weight: 1
                }}
              />
            )}
          </React.Fragment>
        ))}
      </MapContainer>

      {/* Map Overlay UI */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <div className="glass-panel px-3 py-2 rounded-lg border-white/10 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Global Sentinel Network</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <span className="text-[10px] font-mono text-gray-400 uppercase">Nodes: 1,422</span>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-[1000] glass-panel px-3 py-2 rounded-lg border-white/10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[9px] font-bold text-gray-300 uppercase">Confirmed Site</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-primary" />
            <span className="text-[9px] font-bold text-gray-300 uppercase">Scanning Area</span>
          </div>
        </div>
      </div>
    </div>
  );
};
