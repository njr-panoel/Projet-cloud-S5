import React, { useEffect, useState } from 'react';
import { Filter, List } from 'lucide-react';
import { Card, Button, Select, Badge, getStatutBadgeVariant, getStatutLabel } from '../../components/ui';
import { MapComponent } from '../../components/map';
import { StatsGlobal } from '../../components/stats';
import { useSignalementStore } from '../../stores/signalementStore';
import type { Signalement } from '../../types';

export const VisiteurPage: React.FC = () => {
  const { signalements, stats, fetchSignalements, fetchStats, isLoading, setFilters, filters } = useSignalementStore();
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedSignalement, setSelectedSignalement] = useState<Signalement | null>(null);

  useEffect(() => {
    fetchSignalements();
    fetchStats();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value || undefined });
  };

  const statutOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'SIGNALE', label: 'Signalé' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'TERMINE', label: 'Terminé' },
    { value: 'REJETE', label: 'Rejeté' },
  ];

  const typeOptions = [
    { value: '', label: 'Tous les types' },
    { value: 'ROUTE', label: 'Route' },
    { value: 'TROTTOIR', label: 'Trottoir' },
    { value: 'ECLAIRAGE', label: 'Éclairage' },
    { value: 'ASSAINISSEMENT', label: 'Assainissement' },
    { value: 'AUTRE', label: 'Autre' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-secondary-800">
              Carte des Travaux - Antananarivo
            </h1>
            <Button
              variant="ghost"
              onClick={() => setShowSidebar(!showSidebar)}
              leftIcon={showSidebar ? <List className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
            >
              {showSidebar ? 'Masquer' : 'Filtres'}
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
        <div className="flex gap-6">
          {/* Map */}
          <div className={`flex-1 transition-all duration-300 ${showSidebar ? 'lg:mr-80' : ''}`}>
            <Card padding="none" className="overflow-hidden">
              <MapComponent
                signalements={signalements}
                onMarkerClick={setSelectedSignalement}
                height="calc(100vh - 300px)"
              />
            </Card>
          </div>

          {/* Sidebar */}
          {showSidebar && (
            <aside className="hidden lg:block fixed right-8 top-48 w-72 space-y-4 animate-slide-up">
              {/* Filters */}
              <Card>
                <h3 className="font-semibold text-secondary-800 mb-4 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
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

              {/* Selected Signalement */}
              {selectedSignalement && (
                <Card className="animate-fade-in">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-secondary-800">
                      {selectedSignalement.titre}
                    </h3>
                    <Badge variant={getStatutBadgeVariant(selectedSignalement.statut)}>
                      {getStatutLabel(selectedSignalement.statut)}
                    </Badge>
                  </div>
                  <p className="text-sm text-secondary-600 mb-3">
                    {selectedSignalement.description}
                  </p>
                  {selectedSignalement.adresse && (
                    <p className="text-xs text-secondary-500">
                      📍 {selectedSignalement.adresse}
                    </p>
                  )}
                  {selectedSignalement.entreprise && (
                    <p className="text-xs text-secondary-500 mt-1">
                      🏢 {selectedSignalement.entreprise}
                    </p>
                  )}
                  {selectedSignalement.photos && selectedSignalement.photos.length > 0 && (
                    <img
                      src={selectedSignalement.photos[0]}
                      alt={selectedSignalement.titre}
                      className="w-full h-32 object-cover rounded-lg mt-3"
                    />
                  )}
                </Card>
              )}

              {/* Legend */}
              <Card>
                <h3 className="font-semibold text-secondary-800 mb-3">Légende</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-warning-500" />
                    <span>Signalé</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary-500" />
                    <span>En cours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-success-500" />
                    <span>Terminé</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-danger-500" />
                    <span>Rejeté</span>
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
