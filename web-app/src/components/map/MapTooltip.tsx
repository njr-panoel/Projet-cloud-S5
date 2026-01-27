import React from 'react';
import { MapPin, Calendar, Tag, Ruler, Banknote, Building2 } from 'lucide-react';
import { Badge, getStatutBadgeVariant, getStatutLabel, getTypeBadgeVariant, getTypeLabel } from '../ui';
import type { Signalement } from '../../types';

interface MapTooltipProps {
  signalement: Signalement;
}

// Formater le budget en Ariary
const formatBudget = (budget: number): string => {
  if (budget >= 1000000) {
    return `${(budget / 1000000).toFixed(1)} M Ar`;
  } else if (budget >= 1000) {
    return `${(budget / 1000).toFixed(0)} K Ar`;
  }
  return `${budget.toLocaleString()} Ar`;
};

export const MapTooltip: React.FC<MapTooltipProps> = ({ signalement }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-w-[280px] p-2">
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

        {/* Surface en m² */}
        {signalement.surfaceM2 && (
          <div className="flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5" />
            <span>{signalement.surfaceM2.toLocaleString()} m²</span>
          </div>
        )}

        {/* Budget */}
        {signalement.budget && (
          <div className="flex items-center gap-1.5">
            <Banknote className="w-3.5 h-3.5" />
            <span>{formatBudget(signalement.budget)}</span>
          </div>
        )}

        {/* Entreprise */}
        {signalement.entreprise && (
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>{signalement.entreprise}</span>
          </div>
        )}
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
