import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents } from 'react-leaflet';
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

// Custom marker icons by status (keep fallback to color markers)
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

// Icons by type (SVG in public/assets/icons)
const typeIcons: Record<string, L.Icon> = {
  NIDS_DE_POULE: new L.Icon({ iconUrl: '/assets/icons/pothole.svg', iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -30] }),
  FISSURE: new L.Icon({ iconUrl: '/assets/icons/crack.svg', iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -30] }),
  EAU: new L.Icon({ iconUrl: '/assets/icons/water.svg', iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -30] }),
  TERMINE: new L.Icon({ iconUrl: '/assets/icons/check.svg', iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -30] }),
  DEFAULT: new L.Icon({ iconUrl: '/assets/icons/default.svg', iconSize: [34, 34], iconAnchor: [17, 34], popupAnchor: [0, -26] }),
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
        {signalements.map((signalement) => {
          const iconByType = typeIcons[signalement.typeTravaux] || typeIcons.DEFAULT;
          
          // Labels et couleurs pour le statut
          const statutLabel: Record<string, string> = {
            'NOUVEAU': 'Nouveau',
            'EN_COURS': 'En cours',
            'TERMINE': 'Terminé',
            'ANNULE': 'Annulé',
          };
          const statutColor: Record<string, string> = {
            'NOUVEAU': '#f59e0b',
            'EN_COURS': '#3b82f6',
            'TERMINE': '#22c55e',
            'ANNULE': '#ef4444',
          };
          
          // Formater le budget
          const formatBudget = (budget: number): string => {
            if (budget >= 1000000) return `${(budget / 1000000).toFixed(1)} M Ar`;
            if (budget >= 1000) return `${(budget / 1000).toFixed(0)} K Ar`;
            return `${budget.toLocaleString()} Ar`;
          };

          // Contenu du tooltip au survol
          const hoverContent = (
            <div style={{ minWidth: 280, maxWidth: 320, padding: 4 }}>
              {/* Titre */}
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: '#1f2937' }}>
                {signalement.titre}
              </div>
              
              {/* Date et Statut */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#6b7280' }}>
                  📅 {new Date(signalement.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <span style={{ 
                  fontSize: 11, 
                  fontWeight: 600, 
                  padding: '2px 8px', 
                  borderRadius: 9999, 
                  backgroundColor: `${statutColor[signalement.statut]}20`,
                  color: statutColor[signalement.statut]
                }}>
                  {statutLabel[signalement.statut]}
                </span>
              </div>

              {/* Infos détaillées */}
              <div style={{ fontSize: 12, color: '#4b5563', borderTop: '1px solid #e5e7eb', paddingTop: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {/* Surface */}
                  <div style={{ backgroundColor: '#f3f4f6', padding: '6px 8px', borderRadius: 6 }}>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>Surface</div>
                    <div style={{ fontWeight: 600, color: '#374151' }}>
                      {signalement.surfaceM2 ? `${signalement.surfaceM2.toLocaleString()} m²` : '—'}
                    </div>
                  </div>
                  
                  {/* Budget */}
                  <div style={{ backgroundColor: '#f3f4f6', padding: '6px 8px', borderRadius: 6 }}>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>Budget</div>
                    <div style={{ fontWeight: 600, color: '#374151' }}>
                      {signalement.budget ? formatBudget(signalement.budget) : '—'}
                    </div>
                  </div>
                </div>

                {/* Entreprise */}
                {signalement.entreprise && (
                  <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>🏢</span>
                    <span style={{ fontWeight: 500 }}>{signalement.entreprise}</span>
                  </div>
                )}

                {/* Lien Photos */}
                {signalement.photos && (
                  <div style={{ marginTop: 8, textAlign: 'center' }}>
                    <span style={{ 
                      fontSize: 11, 
                      color: '#6366f1', 
                      fontWeight: 500
                    }}>
                      📷 Cliquez pour voir les photos de la route
                    </span>
                  </div>
                )}
              </div>
            </div>
          );

          return (
            <Marker
              key={signalement.id}
              position={[signalement.latitude, signalement.longitude]}
              icon={iconByType}
              eventHandlers={{
                click: () => onMarkerClick?.(signalement),
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.95} sticky>
                {hoverContent}
              </Tooltip>
              <Popup>
                <MapTooltip signalement={signalement} />
              </Popup>
            </Marker>
          );
        })}

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
