import React from 'react';
import { useForm, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, ModalFooter, Button, Input, Select } from '../../components/ui';
import { Toast } from '../../components/ui/Toast';
import { useSignalementStore } from '../../stores/signalementStore';
import type { Signalement, SignalementFormData, SignalementStatut } from '../../types';

const editSchema = z.object({
  titre: z.string().min(5, 'Titre minimum 5 caractères'),
  description: z.string().optional(),
  statut: z.enum(['NOUVEAU', 'EN_COURS', 'TERMINE', 'ANNULE']),
  typeTravaux: z.enum(['NIDS_DE_POULE', 'FISSURE', 'AFFAISSEMENT', 'INONDATION', 'SIGNALISATION', 'ECLAIRAGE', 'AUTRE']),
  adresse: z.string().optional(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
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
  const { updateSignalement, updateStatut, isLoading } = useSignalementStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      titre: signalement.titre,
      description: signalement.description || '',
      statut: signalement.statut,
      typeTravaux: signalement.typeTravaux,
      adresse: signalement.adresse || '',
      latitude: signalement.latitude,
      longitude: signalement.longitude,
    },
  });

  const onSubmit = async (data: FieldValues) => {
    try {
      const formData = data as EditFormData;
      
      // If only status changed, use updateStatut
      if (formData.statut !== signalement.statut) {
        await updateStatut(signalement.id, formData.statut as SignalementStatut);
      }
      
      // Update the signalement with other fields
      const updateData: SignalementFormData = {
        titre: formData.titre,
        description: formData.description,
        typeTravaux: formData.typeTravaux,
        statut: formData.statut,
        adresse: formData.adresse,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };
      
      await updateSignalement(signalement.id, updateData);
      Toast.success('Signalement mis à jour');
      onClose();
    } catch {
      Toast.error('Erreur lors de la mise à jour');
    }
  };

  const statutOptions = [
    { value: 'NOUVEAU', label: 'Nouveau' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'TERMINE', label: 'Terminé' },
    { value: 'ANNULE', label: 'Annulé' },
  ];

  const typeOptions = [
    { value: 'NIDS_DE_POULE', label: 'Nids de poule' },
    { value: 'FISSURE', label: 'Fissure' },
    { value: 'AFFAISSEMENT', label: 'Affaissement' },
    { value: 'INONDATION', label: 'Inondation' },
    { value: 'SIGNALISATION', label: 'Signalisation' },
    { value: 'ECLAIRAGE', label: 'Éclairage' },
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            {...register('statut')}
            label="Statut"
            options={statutOptions}
            error={errors.statut?.message}
          />
          <Select
            {...register('typeTravaux')}
            label="Type de travaux"
            options={typeOptions}
            error={errors.typeTravaux?.message}
          />
        </div>

        <Input
          {...register('adresse')}
          label="Adresse"
          placeholder="Adresse du signalement"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            {...register('latitude')}
            type="number"
            step="0.000001"
            label="Latitude"
          />
          <Input
            {...register('longitude')}
            type="number"
            step="0.000001"
            label="Longitude"
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
