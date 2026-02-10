/**
 * Mapping des types de travaux et statuts vers les images
 * Images sources: /public/photos/Cloud-Project-Photos
 */

export const typesTravaux = {
  INONDATION: {
    label: 'Inondation',
    images: ['Innondation1.jpg', 'Innondation2.jpg'],
    thumbnailImage: 'Innondation1.jpg', // Image principale pour les thumbnails
  },
  AFFAISSEMENT: {
    label: 'Affaissement',
    images: ['Affaissement1.jpeg', 'Affaissement2.jpg'],
    thumbnailImage: 'Affaissement1.jpeg',
  },
  SIGNALISATION: {
    label: 'Signalisation',
    images: ['Signalisation1.jpg', 'Signalisation2.jpg', 'Signalisation3.jpg'],
    thumbnailImage: 'Signalisation1.jpg',
  },
} as const;

export const statuts = {
  NOUVEAU: {
    label: 'Nouveau',
    color: 'bg-blue-100 text-blue-800',
    badgeColor: 'bg-blue-500',
    images: ['Nouveau1.jpeg', 'Nouveau2.jpeg'],
    thumbnailImage: 'Nouveau1.jpeg',
  },
  EN_COURS: {
    label: 'En cours',
    color: 'bg-yellow-100 text-yellow-800',
    badgeColor: 'bg-yellow-500',
    images: ['En-Cours1.jpeg', 'En-Cours2.jpeg'],
    thumbnailImage: 'En-Cours1.jpeg',
  },
  TERMINE: {
    label: 'Terminé',
    color: 'bg-green-100 text-green-800',
    badgeColor: 'bg-green-500',
    images: ['Nouveau1.jpeg', 'Nouveau2.jpeg'],
    thumbnailImage: 'Nouveau1.jpeg',
  },
  REJETÉ: {
    label: 'Rejeté',
    color: 'bg-red-100 text-red-800',
    badgeColor: 'bg-red-500',
    images: [],
    thumbnailImage: undefined,
  },
} as const;

/**
 * Images supplémentaires pour enrichir les galeries
 */
export const photosGalerie = [
  'Detruit1.jpg',
  'Detruit2.jpg',
  'Eclairage1.jpg',
  'Eclairage2.jpg',
  'Fissure1.jpg',
  'Fissure2.jpg',
  'Nid-de-poule.jpeg',
  'Nid-de-poule2.jpg',
];

/**
 * Chemin de base des images
 */
export const IMAGES_BASE_PATH = '/photos/Cloud-Project-Photos';

/**
 * Récupérer l'image de thumbnail pour un type de travaux
 */
export const getThumbnailTypesTravaux = (type: keyof typeof typesTravaux): string => {
  const config = typesTravaux[type];
  return config ? `${IMAGES_BASE_PATH}/${config.thumbnailImage}` : '';
};

/**
 * Récupérer l'image de thumbnail pour un statut
 */
export const getThumbnailStatut = (statut: keyof typeof statuts): string | undefined => {
  const config = statuts[statut];
  return config && config.thumbnailImage ? `${IMAGES_BASE_PATH}/${config.thumbnailImage}` : undefined;
};

/**
 * Récupérer toutes les images pour un type de travaux
 */
export const getImagesTypesTravaux = (type: keyof typeof typesTravaux): string[] => {
  const config = typesTravaux[type];
  return config ? config.images.map(img => `${IMAGES_BASE_PATH}/${img}`) : [];
};

/**
 * Récupérer toutes les images pour un statut
 */
export const getImagesStatut = (statut: keyof typeof statuts): string[] => {
  const config = statuts[statut];
  return config ? config.images.map(img => `${IMAGES_BASE_PATH}/${img}`) : [];
};
