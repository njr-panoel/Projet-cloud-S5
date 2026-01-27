import React from 'react';
import type { SignalementStatut, TypeTravaux } from '../../types';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'secondary';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
  danger: 'bg-danger-100 text-danger-700',
  secondary: 'bg-secondary-100 text-secondary-700',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

// Statut badge helper - aligned with backend StatutSignalement enum
export const getStatutBadgeVariant = (statut: SignalementStatut): BadgeVariant => {
  switch (statut) {
    case 'NOUVEAU':
      return 'warning';
    case 'EN_COURS':
      return 'primary';
    case 'TERMINE':
      return 'success';
    case 'ANNULE':
      return 'danger';
    default:
      return 'secondary';
  }
};

export const getStatutLabel = (statut: SignalementStatut): string => {
  switch (statut) {
    case 'NOUVEAU':
      return 'Nouveau';
    case 'EN_COURS':
      return 'En cours';
    case 'TERMINE':
      return 'Terminé';
    case 'ANNULE':
      return 'Annulé';
    default:
      return statut;
  }
};

// Type travaux badge helper - aligned with backend TypeTravaux enum
export const getTypeBadgeVariant = (type: TypeTravaux): BadgeVariant => {
  switch (type) {
    case 'NIDS_DE_POULE':
      return 'danger';
    case 'FISSURE':
      return 'warning';
    case 'AFFAISSEMENT':
      return 'danger';
    case 'INONDATION':
      return 'primary';
    case 'SIGNALISATION':
      return 'secondary';
    case 'ECLAIRAGE':
      return 'warning';
    case 'AUTRE':
      return 'secondary';
    default:
      return 'secondary';
  }
};

export const getTypeLabel = (type: TypeTravaux): string => {
  switch (type) {
    case 'NIDS_DE_POULE':
      return 'Nids de poule';
    case 'FISSURE':
      return 'Fissure';
    case 'AFFAISSEMENT':
      return 'Affaissement';
    case 'INONDATION':
      return 'Inondation';
    case 'SIGNALISATION':
      return 'Signalisation';
    case 'ECLAIRAGE':
      return 'Éclairage';
    case 'AUTRE':
      return 'Autre';
    default:
      return type;
  }
};
