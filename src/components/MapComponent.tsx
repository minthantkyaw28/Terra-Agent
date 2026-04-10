import { MapContainer, TileLayer, useMap, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  center: [number, number];
  zoom: number;
  disturbancePoints?: any[];
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function MapComponent({ center, zoom, disturbancePoints = [] }: MapComponentProps) {
  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      scrollWheelZoom={true}
      zoomControl={false}
      className="h-full w-full"
    >
      <ChangeView center={center} zoom={zoom} />
      
      {/* Dark Matter Base Layer */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {/* Satellite Overlay (Sentinel-2 Mock) */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        opacity={0.4}
      />

      {/* Disturbance Overlays */}
      {disturbancePoints.map((point, idx) => (
        <Circle
          key={idx}
          center={point.coords}
          radius={500}
          pathOptions={{
            fillColor: '#ef4444',
            color: '#ef4444',
            weight: 1,
            fillOpacity: 0.4
          }}
        >
          <Popup>
            <div className="text-black font-sans">
              <p className="text-[10px] font-bold text-red-600 uppercase">Disturbance Detected</p>
              <p className="text-xs font-mono mt-1">NDVI Delta: {point.ndvi_delta}</p>
            </div>
          </Popup>
        </Circle>
      ))}
    </MapContainer>
  );
}
