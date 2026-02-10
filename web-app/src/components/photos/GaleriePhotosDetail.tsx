import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Maximize2, Camera, Construction, CheckCircle } from 'lucide-react';
import type { Signalement } from '../../types';
import { getImagesTypesTravaux, getImagesStatut, typesTravaux, statuts } from '../../config/imageMapping';

interface GaleriePhotosDetailProps {
  signalement: Signalement;
  onClose?: () => void;
}

// Types d'images à afficher
type PhotoCategory = 'signalement' | 'typeTravaux' | 'statut';

interface PhotoItem {
  url: string;
  category: PhotoCategory;
  label: string;
}

/**
 * Composant professionnel pour afficher une galerie de photos avec détails
 * Affiche les photos du type de travaux, du statut et les photos du signalement
 */
export const GaleriePhotosDetail: React.FC<GaleriePhotosDetailProps> = ({
  signalement,
  onClose,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<PhotoCategory | 'all'>('all');

  // Récupérer les photos du signalement
  const signalementPhotos: PhotoItem[] = signalement.photos
    ? signalement.photos.split(',').map(p => p.trim()).filter(p => p).map(url => ({
        url,
        category: 'signalement' as PhotoCategory,
        label: 'Photo du signalement'
      }))
    : [];

  // Récupérer les photos du type de travaux
  const typeTravauxKey = signalement.typeTravaux as keyof typeof typesTravaux;
  const typePhotos: PhotoItem[] = getImagesTypesTravaux(typeTravauxKey).map(url => ({
    url,
    category: 'typeTravaux' as PhotoCategory,
    label: `État de la route - ${typesTravaux[typeTravauxKey]?.label || signalement.typeTravaux}`
  }));

  // Récupérer les photos du statut
  const statutKey = signalement.statut as keyof typeof statuts;
  const statutPhotos: PhotoItem[] = getImagesStatut(statutKey).map(url => ({
    url,
    category: 'statut' as PhotoCategory,
    label: `État construction - ${statuts[statutKey]?.label || signalement.statut}`
  }));

  // Toutes les photos combinées
  const allPhotos: PhotoItem[] = [...signalementPhotos, ...typePhotos, ...statutPhotos];

  // Filtrer par catégorie
  const filteredPhotos = activeCategory === 'all' 
    ? allPhotos 
    : allPhotos.filter(p => p.category === activeCategory);

  if (allPhotos.length === 0) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-white rounded-lg shadow-md p-8 text-center">
        <div className="inline-block bg-gray-100 rounded-full p-4 mb-4">
          <span className="text-3xl">📷</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucune photo disponible</h3>
        <p className="text-gray-600 text-sm">Ce signalement n'a pas encore de photos documentées.</p>
      </div>
    );
  }

  const currentPhoto = filteredPhotos[selectedPhotoIndex] || filteredPhotos[0];
  const photoCount = filteredPhotos.length;

  const handlePrevious = () => {
    const newIndex = selectedPhotoIndex === 0 ? photoCount - 1 : selectedPhotoIndex - 1;
    setSelectedPhotoIndex(newIndex);
    if (fullscreenIndex !== null) setFullscreenIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = selectedPhotoIndex === photoCount - 1 ? 0 : selectedPhotoIndex + 1;
    setSelectedPhotoIndex(newIndex);
    if (fullscreenIndex !== null) setFullscreenIndex(newIndex);
  };

  // Reset l'index quand on change de catégorie
  const handleCategoryChange = (category: PhotoCategory | 'all') => {
    setActiveCategory(category);
    setSelectedPhotoIndex(0);
  };

  // Navigation avec les touches clavier
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') setFullscreenIndex(null);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [photoCount]);

  // Couleurs par catégorie
  const categoryColors: Record<PhotoCategory, { bg: string; text: string; border: string }> = {
    signalement: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-400' },
    typeTravaux: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-400' },
    statut: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-400' },
  };

  const categoryIcons: Record<PhotoCategory, React.ReactNode> = {
    signalement: <Camera className="w-4 h-4" />,
    typeTravaux: <Construction className="w-4 h-4" />,
    statut: <CheckCircle className="w-4 h-4" />,
  };

  const categoryLabels: Record<PhotoCategory, string> = {
    signalement: 'Photos signalement',
    typeTravaux: 'État de la route',
    statut: 'État construction',
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 border-b border-primary-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{signalement.titre}</h2>
            <p className="text-primary-100 text-sm mt-1">{signalement.description}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:bg-primary-600 rounded-lg p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filtres de catégories */}
      <div className="px-6 py-3 bg-gray-100 border-b flex flex-wrap gap-2">
        <button
          onClick={() => handleCategoryChange('all')}
          className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-full transition-all ${
            activeCategory === 'all' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
          }`}
        >
          Toutes ({allPhotos.length})
        </button>
        {signalementPhotos.length > 0 && (
          <button
            onClick={() => handleCategoryChange('signalement')}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-full transition-all ${
              activeCategory === 'signalement' 
                ? `${categoryColors.signalement.bg} ${categoryColors.signalement.text} font-medium`
                : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            {categoryIcons.signalement}
            {categoryLabels.signalement} ({signalementPhotos.length})
          </button>
        )}
        {typePhotos.length > 0 && (
          <button
            onClick={() => handleCategoryChange('typeTravaux')}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-full transition-all ${
              activeCategory === 'typeTravaux'
                ? `${categoryColors.typeTravaux.bg} ${categoryColors.typeTravaux.text} font-medium`
                : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            {categoryIcons.typeTravaux}
            {categoryLabels.typeTravaux} ({typePhotos.length})
          </button>
        )}
        {statutPhotos.length > 0 && (
          <button
            onClick={() => handleCategoryChange('statut')}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-full transition-all ${
              activeCategory === 'statut'
                ? `${categoryColors.statut.bg} ${categoryColors.statut.text} font-medium`
                : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            {categoryIcons.statut}
            {categoryLabels.statut} ({statutPhotos.length})
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Galerie principale */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {/* Photo affichée */}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <img
                  src={currentPhoto.url}
                  alt={currentPhoto.label || `Photo ${selectedPhotoIndex + 1}`}
                  className="w-full h-full object-contain"
                />
                {/* Bouton plein écran */}
                <button
                  onClick={() => setFullscreenIndex(selectedPhotoIndex)}
                  className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-all"
                  title="Plein écran"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>

                {/* Navigation sur la photo */}
                {photoCount > 1 && (
                  <>
                    <button
                      onClick={handlePrevious}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-all"
                      title="Photo précédente (←)"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-all"
                      title="Photo suivante (→)"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Infos photo */}
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    Photo <span className="font-semibold text-gray-800">{selectedPhotoIndex + 1}</span> sur{' '}
                    <span className="font-semibold text-gray-800">{photoCount}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Utilisez les flèches (← →) pour naviguer ou Esc pour quitter le plein écran</p>
                </div>
                <a
                  href={currentPhoto.url}
                  download
                  className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded hover:bg-primary-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </a>
              </div>

              {/* Galerie miniatures */}
              {photoCount > 1 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Autres photos</p>
                  <div className="grid grid-cols-4 gap-3">
                    {filteredPhotos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedPhotoIndex(index)}
                        className={`relative rounded-lg overflow-hidden aspect-square transition-all border-2 ${
                          index === selectedPhotoIndex
                            ? 'border-primary-600 ring-2 ring-primary-300'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <img
                          src={photo.url}
                          alt={photo.label || `Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {index === selectedPhotoIndex && (
                          <div className="absolute inset-0 bg-primary-600/20 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">✓</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar infos */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {/* Statut */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Statut</p>
                <p className="text-lg font-bold text-blue-900 mt-2 capitalize">
                  {signalement.statut.replace('_', ' ')}
                </p>
              </div>

              {/* Type */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">Type de travaux</p>
                <p className="text-lg font-bold text-purple-900 mt-2 capitalize">
                  {signalement.typeTravaux.replace('_', ' ')}
                </p>
              </div>

              {/* Localisation */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Localisation</p>
                <p className="text-sm font-medium text-green-900 mt-2">{signalement.adresse}</p>
                <p className="text-xs text-green-700 mt-2">
                  Lat: {signalement.latitude.toFixed(4)}<br />
                  Lon: {signalement.longitude.toFixed(4)}
                </p>
              </div>

              {/* Détails supplémentaires */}
              {(signalement.surfaceM2 || signalement.budget || signalement.entreprise) && (
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide">Détails</p>
                  <div className="space-y-2 mt-2">
                    {signalement.surfaceM2 && (
                      <div>
                        <span className="text-xs text-amber-700">Surface:</span>
                        <p className="font-semibold text-amber-900">{signalement.surfaceM2} m²</p>
                      </div>
                    )}
                    {signalement.budget && (
                      <div>
                        <span className="text-xs text-amber-700">Budget:</span>
                        <p className="font-semibold text-amber-900">{signalement.budget.toLocaleString()} Ar</p>
                      </div>
                    )}
                    {signalement.entreprise && (
                      <div>
                        <span className="text-xs text-amber-700">Entreprise:</span>
                        <p className="font-semibold text-amber-900">{signalement.entreprise}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {fullscreenIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4"
          onClick={() => setFullscreenIndex(null)}
        >
          <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={filteredPhotos[fullscreenIndex]?.url || ''}
              alt={filteredPhotos[fullscreenIndex]?.label || "Full screen"}
              className="max-w-full max-h-full object-contain"
            />

            {/* Navigation buttons */}
            {photoCount > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-lg"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-lg"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Close button */}
            <button
              onClick={() => setFullscreenIndex(null)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-3 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg text-sm font-medium">
              {fullscreenIndex + 1} / {photoCount}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
