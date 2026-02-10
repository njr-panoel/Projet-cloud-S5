import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, UserPlus, Search, Trash2, Shield, Phone, Mail, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Card, Button, Input, Select, Table, Badge, Modal, ModalFooter } from '../../components/ui';
import { Toast } from '../../components/ui/Toast';
import { userService } from '../../services/userService';
import { syncService } from '../../services/syncService';
import type { User, UserRole, RegisterRequest } from '../../types';

const createUserSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
  nom: z.string().min(2, 'Minimum 2 caractères'),
  prenom: z.string().min(2, 'Minimum 2 caractères'),
  telephone: z.string().optional(),
  role: z.enum(['MANAGER', 'UTILISATEUR_MOBILE']),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: 'MANAGER',
    },
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await userService.getAll();
      setUsers(response);
    } catch (error) {
      Toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onSubmit = async (data: CreateUserFormData) => {
    setIsCreating(true);
    try {
      const request: RegisterRequest = {
        email: data.email,
        password: data.password,
        nom: data.nom,
        prenom: data.prenom,
        telephone: data.telephone,
        role: data.role as UserRole,
      };
      
      await userService.createUser(request);
      Toast.success('Utilisateur créé avec succès');
      setShowCreateModal(false);
      reset();
      fetchUsers();
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : 'Erreur lors de la création');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await userService.deleteUser(selectedUser.id);
      Toast.success('Utilisateur supprimé');
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      Toast.error('Erreur lors de la suppression');
    }
  };

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    try {
      await userService.updateRole(userId, newRole);
      Toast.success('Rôle mis à jour');
      fetchUsers();
    } catch (error) {
      Toast.error('Erreur lors de la mise à jour du rôle');
    }
  };

  // Synchroniser les comptes mobiles vers Firebase Auth
  const handleSyncUsersToFirebase = async () => {
    try {
      const result = await syncService.syncUsersToFirebase();
      if (result.syncedCount > 0) {
        Toast.success(`${result.syncedCount} compte(s) mobile(s) synchronisé(s) vers Firebase Auth !`);
      } else {
        Toast.info('Tous les comptes mobiles sont déjà synchronisés avec Firebase.');
      }
    } catch (error) {
      Toast.error('Erreur lors de la synchronisation vers Firebase');
    }
  };

  const filteredUsers = users
    .filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.nom.toLowerCase().includes(searchLower) ||
        user.prenom.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    });

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'MANAGER':
        return 'danger';
      case 'UTILISATEUR_MOBILE':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  const columns = [
    {
      key: 'user',
      header: 'Utilisateur',
      render: (item: User) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            item.accountLocked ? 'bg-danger-100' : 'bg-primary-100'
          }`}>
            <Users className={`w-5 h-5 ${item.accountLocked ? 'text-danger-600' : 'text-primary-600'}`} />
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
        <Badge variant={getRoleBadgeVariant(item.role)}>
          {item.role === 'UTILISATEUR_MOBILE' ? 'Mobile' : item.role}
        </Badge>
      ),
    },
    {
      key: 'telephone',
      header: 'Téléphone',
      render: (item: User) => item.telephone || '-',
    },
    {
      key: 'status',
      header: 'Statut',
      render: (item: User) => (
        <Badge variant={item.accountLocked ? 'danger' : item.active ? 'success' : 'secondary'}>
          {item.accountLocked ? 'Bloqué' : item.active ? 'Actif' : 'Inactif'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Inscrit le',
      render: (item: User) => new Date(item.createdAt).toLocaleDateString('fr-FR'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: User) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDelete(item)}
            className="p-1.5 text-secondary-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-secondary-800">Gestion des Utilisateurs</h1>
                <p className="text-secondary-500 text-sm">
                  {users.length} utilisateur(s) au total
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={handleSyncUsersToFirebase}
                leftIcon={<RefreshCw className="w-4 h-4" />}
                title="Synchroniser les comptes mobiles vers Firebase"
              >
                Sync Firebase
              </Button>
              <Button
                onClick={() => setShowCreateModal(true)}
                leftIcon={<UserPlus className="w-4 h-4" />}
              >
                Créer un utilisateur
              </Button>
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
            keyExtractor={(item) => item.id.toString()}
            isLoading={isLoading}
            emptyMessage="Aucun utilisateur trouvé"
          />
        </Card>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Créer un utilisateur"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              {...register('prenom')}
              label="Prénom"
              placeholder="Jean"
              error={errors.prenom?.message}
            />
            <Input
              {...register('nom')}
              label="Nom"
              placeholder="Dupont"
              error={errors.nom?.message}
            />
          </div>
          
          <Input
            {...register('email')}
            type="email"
            label="Email"
            placeholder="jean.dupont@example.com"
            error={errors.email?.message}
            leftIcon={<Mail className="w-5 h-5" />}
          />
          
          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            label="Mot de passe"
            placeholder="••••••••"
            error={errors.password?.message}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer hover:text-secondary-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            }
          />
          
          <Input
            {...register('telephone')}
            label="Téléphone (optionnel)"
            placeholder="+261 34 00 000 00"
            leftIcon={<Phone className="w-5 h-5" />}
          />
          
          <Select
            {...register('role')}
            label="Rôle"
            options={[
              { value: 'MANAGER', label: 'Manager (Web)' },
              { value: 'UTILISATEUR_MOBILE', label: 'Utilisateur Mobile (App Ionic)' },
            ]}
            error={errors.role?.message}
          />

          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Annuler
            </Button>
            <Button type="submit" isLoading={isCreating}>
              Créer l'utilisateur
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmer la suppression"
      >
        <p className="text-secondary-600 mb-6">
          Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
          <span className="font-semibold">
            {selectedUser?.prenom} {selectedUser?.nom}
          </span>{' '}
          ? Cette action est irréversible.
        </p>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
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
