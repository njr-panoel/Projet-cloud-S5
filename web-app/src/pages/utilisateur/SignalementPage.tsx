import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Send } from 'lucide-react';
import { Card, Button, Input, Select } from '../../components/ui';
import { MapComponent } from '../../components/map';
import { Toast } from '../../components/ui/Toast';
import { useSignalementStore } from '../../stores/signalementStore';
import type { SignalementFormData as FormDataType } from '../../types';


const signalementSchema = z.object({
  titre: z.string().min(5, 'Titre minimum 5 caractères').max(100),
  description: z.string().optional(),
  typeTravaux: z.enum(['NIDS_DE_POULE', 'FISSURE', 'AFFAISSEMENT', 'INONDATION', 'SIGNALISATION', 'ECLAIRAGE', 'AUTRE']),
  adresse: z.string().optional(),
});

type SignalementFormData = z.infer<typeof signalementSchema>;

export const SignalementPage: React.FC = () => {
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const { createSignalement, isLoading } = useSignalementStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignalementFormData>({
    resolver: zodResolver(signalementSchema),
    defaultValues: {
      typeTravaux: 'AUTRE',
    },
  });

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPosition({ lat, lng });
  };

  const onSubmit = async (data: SignalementFormData) => {
    if (!selectedPosition) {
      Toast.error('Veuillez sélectionner un emplacement sur la carte');
      return;
    }

    try {
      const formData: FormDataType = {
        titre: data.titre,
        description: data.description,
        typeTravaux: data.typeTravaux,
        adresse: data.adresse,
        latitude: selectedPosition.lat,
        longitude: selectedPosition.lng,
      };
      
      await createSignalement(formData);
      Toast.success('Signalement créé avec succès !');
      reset();
      setSelectedPosition(null);
    } catch (error) {
      Toast.error('Erreur lors de la création du signalement');
    }
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-secondary-800">
            Nouveau Signalement
          </h1>
          <p className="text-secondary-500 mt-1">
            Cliquez sur la carte pour sélectionner l'emplacement du problème
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card padding="none" className="overflow-hidden">
              <MapComponent
                onMapClick={handleMapClick}
                selectedPosition={selectedPosition}
                height="calc(100vh - 250px)"
              />
            </Card>
            {selectedPosition && (
              <div className="mt-2 flex items-center gap-2 text-sm text-secondary-600">
                <MapPin className="w-4 h-4 text-primary-600" />
                Position: {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
              </div>
            )}
          </div>

          {/* Form */}
          <div className="lg:col-span-1">
            <Card>
              <h2 className="text-lg font-semibold text-secondary-800 mb-4">
                Détails du signalement
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  {...register('titre')}
                  label="Titre"
                  placeholder="Ex: Nid de poule dangereux"
                  error={errors.titre?.message}
                />

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    className={`input min-h-[100px] resize-none ${errors.description ? 'input-error' : ''}`}
                    placeholder="Décrivez le problème en détail..."
                  />
                  {errors.description && (
                    <p className="mt-1.5 text-sm text-danger-600">{errors.description.message}</p>
                  )}
                </div>

                <Select
                  {...register('typeTravaux')}
                  label="Type de travaux"
                  options={typeOptions}
                  error={errors.typeTravaux?.message}
                />

                <Input
                  {...register('adresse')}
                  label="Adresse (optionnel)"
                  placeholder="Ex: Rue de l'Indépendance"
                />

                <Button
                  type="submit"
                  fullWidth
                  isLoading={isLoading}
                  disabled={!selectedPosition}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Envoyer le signalement
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
