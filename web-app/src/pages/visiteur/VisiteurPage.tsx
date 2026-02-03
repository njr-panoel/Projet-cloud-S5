import React, { useEffect, useState } from 'react';
import { Filter, List, MapPin, Calendar, Building2 } from 'lucide-react';
import { Card, Button, Select, Badge, getStatutBadgeVariant, getStatutLabel } from '../../components/ui';
import { MapComponent } from '../../components/map';
import { StatsGlobal } from '../../components/stats';
import { useSignalementStore } from '../../stores/signalementStore';
import type { Signalement } from '../../types';

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'NIDS_DE_POULE': 'Nids de poule',
    'FISSURE': 'Fissure',
    'AFFAISSEMENT': 'Affaissement',
    'INONDATION': 'Inondation',
    'SIGNALISATION': 'Signalisation',
    'ECLAIRAGE': 'Éclairage',
    'AUTRE': 'Autre',
  };
  return labels[type] || type;
};

export const VisiteurPage: React.FC = () => {
  const { filteredSignalements, stats, fetchSignalements, isLoading, setFilters, filters } = useSignalementStore();
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedSignalement, setSelectedSignalement] = useState<Signalement | null>(null);

  useEffect(() => {
    fetchSignalements();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value || undefined });
  };

  const statutOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'NOUVEAU', label: 'Nouveau' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'TERMINE', label: 'Terminé' },
    { value: 'ANNULE', label: 'Annulé' },
  ];

  const typeOptions = [
    { value: '', label: 'Tous les types' },
    { value: 'NIDS_DE_POULE', label: 'Nids de poule' },
    { value: 'FISSURE', label: 'Fissure' },
    { value: 'AFFAISSEMENT', label: 'Affaissement' },
    { value: 'INONDATION', label: 'Inondation' },
    { value: 'SIGNALISATION', label: 'Signalisation' },
    { value: 'ECLAIRAGE', label: 'Éclairage' },
    { value: 'AUTRE', label: 'Autre' },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Carte des Travaux Routiers
              </h1>
              <p className="text-gray-500 text-sm mt-1">Antananarivo et environs</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => setShowSidebar(!showSidebar)}
              leftIcon={showSidebar ? <List className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
            >
              {showSidebar ? 'Masquer panneau' : 'Afficher filtres'}
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <StatsGlobal stats={stats} isLoading={isLoading} />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex gap-6 relative">
          {/* Map Container */}
          <div className={`flex-1 transition-all duration-300 ${showSidebar ? 'lg:pr-80' : ''}`}>
            <Card padding="none" className="overflow-hidden rounded-xl shadow-lg">
              <MapComponent
                signalements={filteredSignalements}
                onMarkerClick={setSelectedSignalement}
                height="calc(100vh - 320px)"
              />
            </Card>
          </div>

          {/* Sidebar */}
          {showSidebar && (
            <aside className="hidden lg:block fixed right-8 top-52 w-72 space-y-4 z-10">
              {/* Filters Card */}
              <Card className="shadow-lg">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-indigo-600" />
                  Filtres
                </h3>
                <div className="space-y-3">
                  <Select
                    label="Statut"
                    options={statutOptions}
                    value={(filters.statut as string) || ''}
                    onChange={(e) => handleFilterChange('statut', e.target.value)}
                  />
                  <Select
                    label="Type de travaux"
                    options={typeOptions}
                    value={(filters.typeTravaux as string) || ''}
                    onChange={(e) => handleFilterChange('typeTravaux', e.target.value)}
                  />
                </div>
              </Card>

              {/* Selected Signalement Card */}
              {selectedSignalement && (
                <Card className="shadow-lg animate-fade-in border-l-4 border-indigo-500">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-800 leading-tight">
                      {selectedSignalement.titre}
                    </h3>
                    <Badge variant={getStatutBadgeVariant(selectedSignalement.statut)}>
                      {getStatutLabel(selectedSignalement.statut)}
                    </Badge>
                  </div>
                  
                  {selectedSignalement.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {selectedSignalement.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedSignalement.adresse || `${selectedSignalement.latitude.toFixed(4)}, ${selectedSignalement.longitude.toFixed(4)}`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(selectedSignalement.createdAt)}</span>
                    </div>
                    {selectedSignalement.entreprise && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Building2 className="w-4 h-4" />
                        <span>{selectedSignalement.entreprise}</span>
                      </div>
                    )}
                  </div>

                  {/* Extra info */}
                  <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 rounded p-2">
                      <span className="text-gray-500">Type</span>
                      <p className="font-medium text-gray-800">{getTypeLabel(selectedSignalement.typeTravaux)}</p>
                    </div>
                    {(selectedSignalement.surfaceM2 !== undefined && selectedSignalement.surfaceM2 !== null) && (
                      <div className="bg-gray-50 rounded p-2">
                        <span className="text-gray-500">Surface</span>
                        <p className="font-medium text-gray-800">{selectedSignalement.surfaceM2} m²</p>
                      </div>
                    )}
                    {(selectedSignalement.budget !== undefined && selectedSignalement.budget !== null) && (
                      <div className="bg-gray-50 rounded p-2 col-span-2">
                        <span className="text-gray-500">Budget</span>
                        <p className="font-medium text-gray-800">{selectedSignalement.budget.toLocaleString()} Ar</p>
                      </div>
                    )}
                  </div>
    
                  {selectedSignalement.photos && (
                    <img
                      src={selectedSignalement.photos.split(',')[0]}
                      alt={selectedSignalement.titre}
                      className="w-full h-28 object-cover rounded-lg mt-3"
                    />
                  )}
                </Card>
              )}

              {/* Legend Card */}
              <Card className="shadow-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Légende</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-gray-600">Nouveau</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-gray-600">En cours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-gray-600">Terminé</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-gray-600">Annulé</span>
                  </div>
                </div>
              </Card>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};
