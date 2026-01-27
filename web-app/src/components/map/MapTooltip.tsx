import React from 'react';
import { MapPin, Calendar, Tag } from 'lucide-react';
import { Badge, getStatutBadgeVariant, getStatutLabel, getTypeBadgeVariant, getTypeLabel } from '../ui';
import type { Signalement } from '../../types';

interface MapTooltipProps {
  signalement: Signalement;
}

export const MapTooltip: React.FC<MapTooltipProps> = ({ signalement }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-w-[250px] p-2">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-secondary-800 text-base leading-tight">
          {signalement.titre}
        </h3>
        <Badge variant={getStatutBadgeVariant(signalement.statut)}>
          {getStatutLabel(signalement.statut)}
        </Badge>
      </div>

      <p className="text-sm text-secondary-600 mb-3 line-clamp-2">
        {signalement.description}
      </p>

      <div className="space-y-1.5 text-xs text-secondary-500">
        {signalement.adresse && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{signalement.adresse}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(signalement.createdAt)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5" />
          <Badge variant={getTypeBadgeVariant(signalement.typeTravaux)} className="text-xs">
            {getTypeLabel(signalement.typeTravaux)}
          </Badge>
        </div>
      </div>

      {signalement.photos && (
        <div className="mt-3 pt-2 border-t border-secondary-100">
          <img
            src={signalement.photos.split(',')[0]}
            alt={signalement.titre}
            className="w-full h-24 object-cover rounded"
          />
        </div>
      )}
    </div>
  );
};
