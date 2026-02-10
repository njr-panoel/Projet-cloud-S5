import React from 'react';
import { getThumbnailStatut, statuts } from '../../config/imageMapping';

interface IconStatutProps {
  statut: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showBadge?: boolean;
  className?: string;
}

/**
 * Composant pour afficher l'icône/image du statut
 */
export const IconStatut: React.FC<IconStatutProps> = ({
  statut,
  size = 'md',
  showLabel = false,
  showBadge = false,
  className = '',
}) => {
  const imageSrc = getThumbnailStatut(statut as any);
  const statutConfig = statuts[statut as keyof typeof statuts];

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={statut}
          className={`${sizeClasses[size]} rounded-md object-cover border border-gray-300`}
          loading="lazy"
        />
      ) : (
        <div className={`${sizeClasses[size]} bg-gray-200 rounded-md flex items-center justify-center`}>
          <span className="text-xs font-semibold text-gray-600">{statut.substring(0, 2)}</span>
        </div>
      )}
      {showBadge && statutConfig && (
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${statutConfig.color}`}>
          {statutConfig.label}
        </div>
      )}
      {showLabel && <span className="text-xs text-gray-600 text-center">{statut}</span>}
    </div>
  );
};
