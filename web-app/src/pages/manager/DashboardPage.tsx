import React, { useEffect, useState } from 'react';
import { 
  Search, 
  RefreshCw, 
  Filter, 
  Edit, 
  Trash2,
  ChevronDown
} from 'lucide-react';
import { Card, Button, Input, Select, Table, Badge, Modal, ModalFooter } from '../../components/ui';
import { getStatutBadgeVariant, getStatutLabel, getTypeBadgeVariant, getTypeLabel } from '../../components/ui/Badge';
import { Toast } from '../../components/ui/Toast';
import { useSignalementStore } from '../../stores/signalementStore';
import { SignalementEditModal } from './SignalementEditModal';
import type { Signalement, SignalementFilters, SignalementStatut, TypeTravaux } from '../../types';

export const DashboardPage: React.FC = () => {
  const { 
    filteredSignalements, 
    fetchSignalements, 
    isLoading, 
    filters,
    setFilters,
    clearFilters,
    deleteSignalement,
    stats
  } = useSignalementStore();

  // helper to get store (for inline stats cards above)
  const get = useSignalementStore.getState;

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSignalement, setSelectedSignalement] = useState<Signalement | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Local filter state
  const [localFilters, setLocalFilters] = useState<SignalementFilters>({
    statut: '',
    typeTravaux: '',
  });

  useEffect(() => {
    fetchSignalements();
  }, []);

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm });
  };

  const handleApplyFilters = () => {
    setFilters({ ...localFilters, search: searchTerm });
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setLocalFilters({ statut: '', typeTravaux: '' });
    setSearchTerm('');
    clearFilters();
  };

  const handleSyncFromFirebase = async () => {
    setIsSyncing(true);
    try {
      await syncService.syncFromFirebase();
      await fetchSignalements();
      Toast.success('Synchronisation depuis Firebase réussie !');
    } catch (error) {
      Toast.error('Erreur lors de la synchronisation depuis Firebase');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncToFirebase = async () => {
    setIsSyncing(true);
    try {
      await syncService.syncToFirebase();
      Toast.success('Synchronisation vers Firebase réussie !');
    } catch (error) {
      Toast.error('Erreur lors de la synchronisation vers Firebase');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEdit = (signalement: Signalement) => {
    setSelectedSignalement(signalement);
    setShowEditModal(true);
  };

  const handleDelete = (signalement: Signalement) => {
    setSelectedSignalement(signalement);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedSignalement) return;
    try {
      await deleteSignalement(selectedSignalement.id);
      Toast.success('Signalement supprimé');
      setShowDeleteModal(false);
      setSelectedSignalement(null);
    } catch (error) {
      Toast.error('Erreur lors de la suppression');
    }
  };

  const columns = [
    {
      key: 'titre',
      header: 'Titre',
      sortable: true,
      render: (item: Signalement) => (
        <div>
          <p className="font-medium text-secondary-800">{item.titre}</p>
          <p className="text-xs text-secondary-500 truncate max-w-[200px]">
            {item.description}
          </p>
        </div>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      sortable: true,
      render: (item: Signalement) => (
        <Badge variant={getStatutBadgeVariant(item.statut)}>
          {getStatutLabel(item.statut)}
        </Badge>
      ),
    },
    {
      key: 'typeTravaux',
      header: 'Type',
      sortable: true,
      render: (item: Signalement) => (
        <Badge variant={getTypeBadgeVariant(item.typeTravaux)}>
          {getTypeLabel(item.typeTravaux)}
        </Badge>
      ),
    },
    {
      key: 'user',
      header: 'Signalé par',
      render: (item: Signalement) => item.user ? `${item.user.prenom} ${item.user.nom}` : '-',
    },
    {
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      render: (item: Signalement) => (
        new Date(item.createdAt).toLocaleDateString('fr-FR')
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Signalement) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
            className="p-1.5 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
            className="p-1.5 text-secondary-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const statutOptions = [
    { value: '', label: 'Tous' },
    { value: 'NOUVEAU', label: 'Nouveau' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'TERMINE', label: 'Terminé' },
    { value: 'ANNULE', label: 'Annulé' },
  ];

  const typeOptions = [
    { value: '', label: 'Tous' },
    { value: 'NIDS_DE_POULE', label: 'Nids de poule' },
    { value: 'FISSURE', label: 'Fissure' },
    { value: 'AFFAISSEMENT', label: 'Affaissement' },
    { value: 'INONDATION', label: 'Inondation' },
    { value: 'SIGNALISATION', label: 'Signalisation' },
    { value: 'ECLAIRAGE', label: 'Éclairage' },
    { value: 'AUTRE', label: 'Autre' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-secondary-800">Dashboard Manager</h1>
              <p className="text-secondary-500 text-sm">Gestion des signalements</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleSyncFromFirebase}
                isLoading={isSyncing}
                leftIcon={<RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />}
              >
                Récupérer (from Firebase)
              </Button>
              <Button
                variant="primary"
                onClick={handleSyncToFirebase}
                isLoading={isSyncing}
              >
                Envoyer (to Firebase)
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-sm text-secondary-500">Nombre de signalements</div>
              <div className="text-2xl font-bold text-secondary-800">{get().stats?.totalSignalements ?? 0}</div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-sm text-secondary-500">Surface totale (m²)</div>
              <div className="text-2xl font-bold text-secondary-800">{get().stats?.totalSurface ?? 0}</div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-sm text-secondary-500">Avancement</div>
              <div className="text-2xl font-bold text-secondary-800">{get().stats?.pourcentageTermine ?? 0}%</div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="text-sm text-secondary-500">Budget total</div>
              <div className="text-2xl font-bold text-secondary-800">{(get().stats?.totalBudget ?? 0).toLocaleString()} Ar</div>
            </div>
          </div>

          {/* Search & Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                leftIcon={<Search className="w-5 h-5" />}
              />
              <Button onClick={handleSearch}>Rechercher</Button>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter className="w-4 h-4" />}
              rightIcon={<ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />}
            >
              Filtres
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-secondary-50 rounded-lg p-4 mb-6 animate-slide-up">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Statut"
                  options={statutOptions}
                  value={localFilters.statut || ''}
                  onChange={(e) => setLocalFilters({ ...localFilters, statut: e.target.value as SignalementStatut })}
                />
                <Select
                  label="Type"
                  options={typeOptions}
                  value={localFilters.typeTravaux || ''}
                  onChange={(e) => setLocalFilters({ ...localFilters, typeTravaux: e.target.value as TypeTravaux })}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="ghost" onClick={handleResetFilters}>
                  Réinitialiser
                </Button>
                <Button onClick={handleApplyFilters}>
                  Appliquer
                </Button>
              </div>
            </div>
          )}

          {/* Table */}
          <Table
            data={filteredSignalements}
            columns={columns}
            keyExtractor={(item) => item.id.toString()}
            onRowClick={handleEdit}
            isLoading={isLoading}
            emptyMessage="Aucun signalement trouvé"
          />
        </Card>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedSignalement && (
        <SignalementEditModal
          signalement={selectedSignalement}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSignalement(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmer la suppression"
        size="sm"
      >
        <p className="text-secondary-600">
          Êtes-vous sûr de vouloir supprimer le signalement "{selectedSignalement?.titre}" ?
          Cette action est irréversible.
        </p>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Supprimer
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};
