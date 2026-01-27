import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Upload, X, Send } from 'lucide-react';
import { Card, Button, Input, Select } from '../../components/ui';
import { MapComponent } from '../../components/map';
import { Toast } from '../../components/ui/Toast';
import { useSignalementStore } from '../../stores/signalementStore';


const signalementSchema = z.object({
  titre: z.string().min(5, 'Titre minimum 5 caractères').max(100),
  description: z.string().min(20, 'Description minimum 20 caractères').max(1000),
  typeTravaux: z.enum(['ROUTE', 'TROTTOIR', 'ECLAIRAGE', 'ASSAINISSEMENT', 'AUTRE']),
  priorite: z.enum(['BASSE', 'MOYENNE', 'HAUTE', 'URGENTE']).optional(),
  adresse: z.string().optional(),
});

type SignalementFormData = z.infer<typeof signalementSchema>;

export const SignalementPage: React.FC = () => {
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createSignalement, isLoading } = useSignalementStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignalementFormData>({
    resolver: zodResolver(signalementSchema),
    defaultValues: {
      priorite: 'MOYENNE',
    },
  });

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPosition({ lat, lng });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 5) {
      Toast.warning('Maximum 5 photos autorisées');
      return;
    }

    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: SignalementFormData) => {
    if (!selectedPosition) {
      Toast.error('Veuillez sélectionner un emplacement sur la carte');
      return;
    }

    try {
      await createSignalement({
        ...data,
        latitude: selectedPosition.lat,
        longitude: selectedPosition.lng,
        photos: photos.length > 0 ? photos : undefined,
      });
      Toast.success('Signalement créé avec succès !');
      reset();
      setSelectedPosition(null);
      setPhotos([]);
      setPhotoPreviews([]);
    } catch (error) {
      Toast.error('Erreur lors de la création du signalement');
    }
  };

  const typeOptions = [
    { value: 'ROUTE', label: 'Route' },
    { value: 'TROTTOIR', label: 'Trottoir' },
    { value: 'ECLAIRAGE', label: 'Éclairage' },
    { value: 'ASSAINISSEMENT', label: 'Assainissement' },
    { value: 'AUTRE', label: 'Autre' },
  ];

  const prioriteOptions = [
    { value: 'BASSE', label: 'Basse' },
    { value: 'MOYENNE', label: 'Moyenne' },
    { value: 'HAUTE', label: 'Haute' },
    { value: 'URGENTE', label: 'Urgente' },
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

                <Select
                  {...register('priorite')}
                  label="Priorité"
                  options={prioriteOptions}
                />

                <Input
                  {...register('adresse')}
                  label="Adresse (optionnel)"
                  placeholder="Ex: Rue de l'Indépendance"
                />

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Photos (max 5)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  
                  {photoPreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {photoPreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 p-1 bg-danger-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {photos.length < 5 && (
                    <Button
                      type="button"
                      variant="outline"
                      fullWidth
                      onClick={() => fileInputRef.current?.click()}
                      leftIcon={<Upload className="w-4 h-4" />}
                    >
                      Ajouter des photos
                    </Button>
                  )}
                </div>

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
