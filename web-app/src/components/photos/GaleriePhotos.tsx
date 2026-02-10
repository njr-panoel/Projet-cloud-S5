import React, { useState } from 'react';
import { getImagesTypesTravaux, getImagesStatut, photosGalerie, IMAGES_BASE_PATH } from '../../config/imageMapping';
import { X } from 'lucide-react';

interface GaleriePhotosProps {
  type?: string; // type_travaux
  statut?: string; // statut
  externalPhotos?: string[]; // URLs externes de photos stockées
  showAllPhotos?: boolean; // Afficher aussi les photos de galerie
  className?: string;
}

/**
 * Composant pour afficher une galerie de photos
 */
export const GaleriePhotos: React.FC<GaleriePhotosProps> = ({
  type,
  statut,
  externalPhotos = [],
  showAllPhotos = true,
  className = '',
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Récupérer toutes les images disponibles
  let allImages: string[] = [];

  if (type) {
    allImages = [...allImages, ...getImagesTypesTravaux(type as any)];
  }
  if (statut) {
    allImages = [...allImages, ...getImagesStatut(statut as any)];
  }

  // Ajouter les photos externes
  allImages = [...allImages, ...externalPhotos];

  // Ajouter les photos de galerie si demandé
  if (showAllPhotos) {
    allImages = [...allImages, ...photosGalerie.map(photo => `${IMAGES_BASE_PATH}/${photo}`)];
  }

  // Supprimer les doublons
  allImages = [...new Set(allImages)];

  if (allImages.length === 0) {
    return <div className="text-gray-500 text-sm">Aucune photo disponible</div>;
  }

  return (
    <div className={className}>
      {/* Galerie de thumbnails */}
      <div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-5">
        {allImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedPhoto(image)}
            className="relative overflow-hidden rounded-lg hover:opacity-80 transition-opacity"
          >
            <img
              src={image}
              alt={`Photo ${index + 1}`}
              className="w-full h-24 object-cover border border-gray-300"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* Modal zoom */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-screen">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedPhoto}
              alt="Agrandie"
              className="max-w-4xl max-h-screen object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
