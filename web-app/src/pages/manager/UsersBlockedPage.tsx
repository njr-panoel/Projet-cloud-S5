import React, { useEffect, useState } from 'react';
import { UserX, Search, Unlock } from 'lucide-react';
import { Card, Button, Input, Table, Badge, Modal, ModalFooter } from '../../components/ui';
import { Toast } from '../../components/ui/Toast';
import { userService } from '../../services/userService';
import type { User } from '../../types';

export const UsersBlockedPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUnblockModal, setShowUnblockModal] = useState(false);

  const fetchBlockedUsers = async (page = 0) => {
    setIsLoading(true);
    try {
      const response = await userService.getBlocked(page, pagination.size);
      setUsers(response.content);
      setPagination({
        page: response.number,
        size: response.size,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
      });
    } catch (error) {
      Toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const handleUnblock = (user: User) => {
    setSelectedUser(user);
    setShowUnblockModal(true);
  };

  const confirmUnblock = async () => {
    if (!selectedUser) return;
    try {
      await userService.unblockUser(selectedUser.id);
      Toast.success(`${selectedUser.prenom} ${selectedUser.nom} a été débloqué`);
      setShowUnblockModal(false);
      setSelectedUser(null);
      fetchBlockedUsers(pagination.page);
    } catch (error) {
      Toast.error('Erreur lors du déblocage');
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.nom.toLowerCase().includes(searchLower) ||
      user.prenom.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    {
      key: 'user',
      header: 'Utilisateur',
      render: (item: User) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-danger-100 rounded-full flex items-center justify-center">
            <UserX className="w-5 h-5 text-danger-600" />
          </div>
          <div>
            <p className="font-medium text-secondary-800">
              {item.prenom} {item.nom}
            </p>
            <p className="text-sm text-secondary-500">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rôle',
      render: (item: User) => (
        <Badge variant="secondary">{item.role}</Badge>
      ),
    },
    {
      key: 'telephone',
      header: 'Téléphone',
      render: (item: User) => item.telephone || '-',
    },
    {
      key: 'createdAt',
      header: 'Inscrit le',
      render: (item: User) => (
        new Date(item.createdAt).toLocaleDateString('fr-FR')
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: User) => (
        <Button
          variant="success"
          size="sm"
          onClick={() => handleUnblock(item)}
          leftIcon={<Unlock className="w-4 h-4" />}
        >
          Débloquer
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-danger-100 rounded-lg">
              <UserX className="w-6 h-6 text-danger-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-secondary-800">Utilisateurs Bloqués</h1>
              <p className="text-secondary-500 text-sm">
                {pagination.totalElements} utilisateur(s) bloqué(s)
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="Rechercher par nom, prénom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>

          {/* Table */}
          <Table
            data={filteredUsers}
            columns={columns}
            keyExtractor={(item) => item.id}
            isLoading={isLoading}
            emptyMessage="Aucun utilisateur bloqué"
            pagination={{
              page: pagination.page,
              pageSize: pagination.size,
              totalItems: pagination.totalElements,
              onPageChange: fetchBlockedUsers,
            }}
          />
        </Card>
      </div>

      {/* Unblock Confirmation Modal */}
      <Modal
        isOpen={showUnblockModal}
        onClose={() => setShowUnblockModal(false)}
        title="Confirmer le déblocage"
        size="sm"
      >
        <p className="text-secondary-600">
          Êtes-vous sûr de vouloir débloquer{' '}
          <span className="font-semibold">
            {selectedUser?.prenom} {selectedUser?.nom}
          </span>
          ? Cette personne pourra à nouveau accéder à son compte.
        </p>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowUnblockModal(false)}>
            Annuler
          </Button>
          <Button variant="success" onClick={confirmUnblock}>
            Débloquer
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};
