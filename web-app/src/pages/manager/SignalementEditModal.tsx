import React from 'react';
import { useForm, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, ModalFooter, Button, Input, Select } from '../../components/ui';
import { Toast } from '../../components/ui/Toast';
import { useSignalementStore } from '../../stores/signalementStore';
import type { Signalement } from '../../types';

const editSchema = z.object({
  titre: z.string().min(5, 'Titre minimum 5 caractères'),
  description: z.string().min(20, 'Description minimum 20 caractères'),
  statut: z.enum(['SIGNALE', 'EN_COURS', 'TERMINE', 'REJETE']),
  priorite: z.enum(['BASSE', 'MOYENNE', 'HAUTE', 'URGENTE']),
  typeTravaux: z.enum(['ROUTE', 'TROTTOIR', 'ECLAIRAGE', 'ASSAINISSEMENT', 'AUTRE']),
  entreprise: z.string().optional(),
  surface: z.coerce.number().optional(),
  budget: z.coerce.number().optional(),
  dateDebut: z.string().optional(),
  dateFin: z.string().optional(),
});

type EditFormData = z.infer<typeof editSchema>;

interface SignalementEditModalProps {
  signalement: Signalement;
  isOpen: boolean;
  onClose: () => void;
}

export const SignalementEditModal: React.FC<SignalementEditModalProps> = ({
  signalement,
  isOpen,
  onClose,
}) => {
  const { updateSignalement, isLoading } = useSignalementStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      titre: signalement.titre,
      description: signalement.description,
      statut: signalement.statut,
      priorite: signalement.priorite,
      typeTravaux: signalement.typeTravaux,
      entreprise: signalement.entreprise || '',
      surface: signalement.surface,
      budget: signalement.budget,
      dateDebut: signalement.dateDebut?.split('T')[0],
      dateFin: signalement.dateFin?.split('T')[0],
    },
  });

  const onSubmit = async (data: FieldValues) => {
    try {
      await updateSignalement(signalement.id, data as EditFormData);
      Toast.success('Signalement mis à jour');
      onClose();
    } catch {
      Toast.error('Erreur lors de la mise à jour');
    }
  };

  const statutOptions = [
    { value: 'SIGNALE', label: 'Signalé' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'TERMINE', label: 'Terminé' },
    { value: 'REJETE', label: 'Rejeté' },
  ];

  const prioriteOptions = [
    { value: 'BASSE', label: 'Basse' },
    { value: 'MOYENNE', label: 'Moyenne' },
    { value: 'HAUTE', label: 'Haute' },
    { value: 'URGENTE', label: 'Urgente' },
  ];

  const typeOptions = [
    { value: 'ROUTE', label: 'Route' },
    { value: 'TROTTOIR', label: 'Trottoir' },
    { value: 'ECLAIRAGE', label: 'Éclairage' },
    { value: 'ASSAINISSEMENT', label: 'Assainissement' },
    { value: 'AUTRE', label: 'Autre' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier le signalement" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          {...register('titre')}
          label="Titre"
          error={errors.titre?.message}
        />

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1.5">
            Description
          </label>
          <textarea
            {...register('description')}
            className={`input min-h-[80px] resize-none ${errors.description ? 'input-error' : ''}`}
          />
          {errors.description && (
            <p className="mt-1.5 text-sm text-danger-600">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            {...register('statut')}
            label="Statut"
            options={statutOptions}
            error={errors.statut?.message}
          />
          <Select
            {...register('priorite')}
            label="Priorité"
            options={prioriteOptions}
            error={errors.priorite?.message}
          />
          <Select
            {...register('typeTravaux')}
            label="Type"
            options={typeOptions}
            error={errors.typeTravaux?.message}
          />
        </div>

        <Input
          {...register('entreprise')}
          label="Entreprise"
          placeholder="Nom de l'entreprise"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            {...register('surface')}
            type="number"
            label="Surface (m²)"
            placeholder="0"
          />
          <Input
            {...register('budget')}
            type="number"
            label="Budget (Ar)"
            placeholder="0"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            {...register('dateDebut')}
            type="date"
            label="Date de début"
          />
          <Input
            {...register('dateFin')}
            type="date"
            label="Date de fin"
          />
        </div>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Enregistrer
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
