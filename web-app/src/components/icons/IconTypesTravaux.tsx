import React from 'react';
import { getThumbnailTypesTravaux, getImagesTypesTravaux } from '../../config/imageMapping';

interface IconTypesTravauxProps {
  type: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

/**
 * Composant pour afficher l'icône/image du type de travaux
 */
export const IconTypesTravaux: React.FC<IconTypesTravauxProps> = ({
  type,
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const imageSrc = getThumbnailTypesTravaux(type as any);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  if (!imageSrc) {
    return <div className={`${sizeClasses[size]} bg-gray-200 rounded-full`} />;
  }

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <img
        src={imageSrc}
        alt={type}
        className={`${sizeClasses[size]} rounded-md object-cover border border-gray-300`}
        loading="lazy"
      />
      {showLabel && <span className="text-xs text-gray-600 text-center">{type}</span>}
    </div>
  );
};
