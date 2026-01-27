import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { config } from '../../config';
import type { Signalement } from '../../types';
import { MapTooltip } from './MapTooltip';

// Fix for default markers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom marker icons by status
const createIcon = (color: string) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

const statusIcons: Record<string, L.Icon> = {
  NOUVEAU: createIcon('orange'),
  EN_COURS: createIcon('blue'),
  TERMINE: createIcon('green'),
  ANNULE: createIcon('red'),
};

interface MapComponentProps {
  signalements?: Signalement[];
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerClick?: (signalement: Signalement) => void;
  selectedPosition?: { lat: number; lng: number } | null;
  height?: string;
  interactive?: boolean;
}

const MapClickHandler: React.FC<{ onClick: (lat: number, lng: number) => void }> = ({ onClick }) => {
  useMapEvents({
    click: (e) => {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const MapComponent: React.FC<MapComponentProps> = ({
  signalements = [],
  onMapClick,
  onMarkerClick,
  selectedPosition,
  height = '100%',
  interactive = true,
}) => {
  return (
    <div style={{ height }} className="w-full rounded-lg overflow-hidden">
      <MapContainer
        center={config.map.defaultCenter}
        zoom={config.map.defaultZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={interactive}
        dragging={interactive}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {onMapClick && <MapClickHandler onClick={onMapClick} />}

        {/* Signalements markers */}
        {signalements.map((signalement) => (
          <Marker
            key={signalement.id}
            position={[signalement.latitude, signalement.longitude]}
            icon={statusIcons[signalement.statut]}
            eventHandlers={{
              click: () => onMarkerClick?.(signalement),
            }}
          >
            <Popup>
              <MapTooltip signalement={signalement} />
            </Popup>
          </Marker>
        ))}

        {/* Selected position marker */}
        {selectedPosition && (
          <Marker position={[selectedPosition.lat, selectedPosition.lng]}>
            <Popup>
              <div className="text-sm">
                <p className="font-medium">Position sélectionnée</p>
                <p className="text-secondary-500">
                  {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};
