import React from 'react';
import { useForm, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
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
  surfaceM2: z.coerce.number().min(0, 'Surface doit être positive').optional().nullable(),
  budget: z.coerce.number().min(0, 'Budget doit être positif').optional().nullable(),
  entreprise: z.string().optional(),
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
      surfaceM2: signalement.surfaceM2 ?? null,
      budget: signalement.budget ?? null,
      entreprise: signalement.entreprise || '',
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
        surfaceM2: formData.surfaceM2 || undefined,
        budget: formData.budget || undefined,
        entreprise: formData.entreprise,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Modifier le signalement</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre</label>
            <input
              {...register('titre')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            {errors.titre && (
              <p className="mt-1 text-sm text-red-500">{errors.titre.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Statut & Type de travaux - Side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Statut</label>
              <select
                {...register('statut')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
              >
                {statutOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type de travaux</label>
              <select
                {...register('typeTravaux')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
              >
                {typeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
            <input
              {...register('adresse')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="Route Nationale 5, Antananarivo"
            />
          </div>

          {/* Latitude & Longitude */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Latitude</label>
              <input
                {...register('latitude')}
                type="number"
                step="0.00001"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Longitude</label>
              <input
                {...register('longitude')}
                type="number"
                step="0.00001"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Informations complémentaires */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Informations complémentaires</h4>
            
            {/* Surface & Budget */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Surface (m²)</label>
                <input
                  {...register('surfaceM2')}
                  type="number"
                  step="0.1"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Ex: 150.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget (Ariary)</label>
                <input
                  {...register('budget')}
                  type="number"
                  step="1000"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Ex: 5000000"
                />
              </div>
            </div>

            {/* Entreprise */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Entreprise en charge</label>
              <input
                {...register('entreprise')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Nom de l'entreprise"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
