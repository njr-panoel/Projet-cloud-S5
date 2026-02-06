import * as React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { config } from '../../config';
import type { Signalement } from '../../types';
import { MapTooltip } from './MapTooltip';

// Créer un marqueur GPS réaliste style Google Maps avec couleur personnalisée
const createGpsMarkerIcon = (color: string, innerColor: string = '#ffffff') => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="48">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
        </filter>
        <linearGradient id="grad-${color.replace('#', '')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${adjustColor(color, -30)};stop-opacity:1" />
        </linearGradient>
      </defs>
      <!-- Pin shape -->
      <path d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24C24 5.4 18.6 0 12 0z" 
            fill="url(#grad-${color.replace('#', '')})" 
            filter="url(#shadow)"
            stroke="${adjustColor(color, -40)}" 
            stroke-width="0.5"/>
      <!-- Inner circle -->
      <circle cx="12" cy="11" r="5" fill="${innerColor}" opacity="0.95"/>
      <!-- Highlight -->
      <ellipse cx="8" cy="7" rx="3" ry="2" fill="white" opacity="0.3"/>
    </svg>
  `;
  
  return new L.DivIcon({
    html: svg,
    className: 'custom-gps-marker',
    iconSize: [32, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -48],
  });
};

// Fonction pour ajuster la luminosité d'une couleur
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Couleurs des statuts
const STATUS_COLORS: Record<string, { main: string; inner: string }> = {
  NOUVEAU: { main: '#f59e0b', inner: '#ffffff' },      // Orange - Nouveau
  EN_COURS: { main: '#3b82f6', inner: '#ffffff' },     // Bleu - En cours
  TERMINE: { main: '#22c55e', inner: '#ffffff' },      // Vert - Terminé
  ANNULE: { main: '#ef4444', inner: '#ffffff' },       // Rouge - Annulé
};

// Créer les icônes par statut
const getStatusIcon = (statut: string): L.DivIcon => {
  const colors = STATUS_COLORS[statut] || STATUS_COLORS.NOUVEAU;
  return createGpsMarkerIcon(colors.main, colors.inner);
};

// Marqueur pour position sélectionnée (rouge vif)
const selectedPositionIcon = createGpsMarkerIcon('#dc2626', '#ffffff');

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
          // Utiliser l'icône basée sur le statut (marqueur GPS réaliste)
          const markerIcon = getStatusIcon(signalement.statut);
          
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
                      fontWeight: 500,
                      cursor: 'pointer'
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
              icon={markerIcon}
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
          <Marker position={[selectedPosition.lat, selectedPosition.lng]} icon={selectedPositionIcon}>
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
