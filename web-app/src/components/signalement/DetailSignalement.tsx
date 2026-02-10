import React from 'react';
import { MapPin, Calendar, Building2, Ruler, Banknote } from 'lucide-react';
import { Badge, getStatutBadgeVariant, getStatutLabel, getTypeBadgeVariant, getTypeLabel } from '../ui';
import { IconTypesTravaux } from '../icons/IconTypesTravaux';
import { IconStatut } from '../icons/IconStatut';
import { GaleriePhotos } from '../photos/GaleriePhotos';
import type { Signalement } from '../../types';

interface DetailSignalementProps {
  signalement: Signalement;
  showGallery?: boolean;
  compact?: boolean;
}

/**
 * Composant pour afficher les détails complets d'un signalement
 * Utilisable sur la carte, dans les listes, dans les modales
 */
export const DetailSignalement: React.FC<DetailSignalementProps> = ({
  signalement,
  showGallery = true,
  compact = false,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatBudget = (budget: number): string => {
    if (budget >= 1000000) {
      return `${(budget / 1000000).toFixed(1)} M Ar`;
    } else if (budget >= 1000) {
      return `${(budget / 1000).toFixed(0)} K Ar`;
    }
    return `${budget.toLocaleString()} Ar`;
  };

  if (compact) {
    return (
      <div>
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 leading-tight">
              {signalement.titre}
            </h3>
          </div>
          <div className="flex flex-col items-center gap-1">
            <IconStatut statut={signalement.statut} size="sm" />
            <Badge variant={getStatutBadgeVariant(signalement.statut)} className="text-xs">
              {getStatutLabel(signalement.statut)}
            </Badge>
          </div>
        </div>

        {signalement.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {signalement.description}
          </p>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>{signalement.adresse || `${signalement.latitude.toFixed(4)}, ${signalement.longitude.toFixed(4)}`}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(signalement.createdAt)}</span>
          </div>
          {signalement.entreprise && (
            <div className="flex items-center gap-2 text-gray-500">
              <Building2 className="w-4 h-4" />
              <span>{signalement.entreprise}</span>
            </div>
          )}
        </div>

        {/* Extra info grid */}
        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 rounded p-2 flex flex-col items-center gap-1">
            <IconTypesTravaux type={signalement.typeTravaux} size="sm" />
            <span className="text-gray-500 text-center">Type</span>
            <p className="font-medium text-gray-800 text-center">{getTypeLabel(signalement.typeTravaux)}</p>
          </div>
          {(signalement.surfaceM2 !== undefined && signalement.surfaceM2 !== null) && (
            <div className="bg-gray-50 rounded p-2 flex flex-col items-center gap-1">
              <Ruler className="w-4 h-4 text-gray-600" />
              <span className="text-gray-500">Surface</span>
              <p className="font-medium text-gray-800">{signalement.surfaceM2} m²</p>
            </div>
          )}
          {(signalement.budget !== undefined && signalement.budget !== null) && (
            <div className="bg-gray-50 rounded p-2 col-span-2 flex flex-col items-center gap-1">
              <Banknote className="w-4 h-4 text-gray-600" />
              <span className="text-gray-500">Budget</span>
              <p className="font-medium text-gray-800">{formatBudget(signalement.budget)}</p>
            </div>
          )}
        </div>

        {/* Photo principale */}
        {signalement.photos && (
          <img
            src={signalement.photos.split(',')[0]}
            alt={signalement.titre}
            className="w-full h-28 object-cover rounded-lg mt-3"
          />
        )}
      </div>
    );
  }

  // Vue complète avec galerie
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-800">
            {signalement.titre}
          </h2>
        </div>
        <div className="flex flex-col items-center gap-1">
          <IconStatut statut={signalement.statut} size="md" />
          <Badge variant={getStatutBadgeVariant(signalement.statut)}>
            {getStatutLabel(signalement.statut)}
          </Badge>
        </div>
      </div>

      {signalement.description && (
        <p className="text-gray-600">
          {signalement.description}
        </p>
      )}

      {/* Info détaillées */}
      <div className="grid grid-cols-2 gap-4">
        {/* Infos principales */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-xs text-gray-500">Adresse</p>
              <p className="font-medium text-gray-800">
                {signalement.adresse || `${signalement.latitude.toFixed(4)}, ${signalement.longitude.toFixed(4)}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-xs text-gray-500">Date signalée</p>
              <p className="font-medium text-gray-800">{formatDate(signalement.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Infos supplémentaires */}
        <div className="space-y-2">
          {signalement.entreprise && (
            <div className="flex items-center gap-2 text-gray-600">
              <Building2 className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-xs text-gray-500">Entreprise</p>
                <p className="font-medium text-gray-800">{signalement.entreprise}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-gray-600">
            <IconTypesTravaux type={signalement.typeTravaux} size="sm" />
            <div>
              <p className="text-xs text-gray-500">Type de travaux</p>
              <p className="font-medium text-gray-800">{getTypeLabel(signalement.typeTravaux)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats supplémentaires */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
        {(signalement.surfaceM2 !== undefined && signalement.surfaceM2 !== null) && (
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Surface</p>
            <p className="text-lg font-semibold text-blue-600">{signalement.surfaceM2.toLocaleString()} m²</p>
          </div>
        )}
        {(signalement.budget !== undefined && signalement.budget !== null) && (
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Budget</p>
            <p className="text-lg font-semibold text-green-600">{formatBudget(signalement.budget)}</p>
          </div>
        )}
        {(signalement.avancement !== undefined && signalement.avancement !== null) && (
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Avancement</p>
            <p className="text-lg font-semibold text-purple-600">{signalement.avancement}%</p>
          </div>
        )}
      </div>

      {/* Galerie de photos */}
      {showGallery && (
        <div className="pt-3 border-t border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3">📷 Photos</h3>
          <GaleriePhotos
            type={signalement.typeTravaux}
            statut={signalement.statut}
            externalPhotos={signalement.photos ? signalement.photos.split(',').map(p => p.trim()) : []}
            showAllPhotos={true}
          />
        </div>
      )}
    </div>
  );
};
