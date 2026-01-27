import React from 'react';
import type { SignalementStatut, SignalementPriorite } from '../../types';

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

// Statut badge helper
export const getStatutBadgeVariant = (statut: SignalementStatut): BadgeVariant => {
  switch (statut) {
    case 'SIGNALE':
      return 'warning';
    case 'EN_COURS':
      return 'primary';
    case 'TERMINE':
      return 'success';
    case 'REJETE':
      return 'danger';
    default:
      return 'secondary';
  }
};

export const getStatutLabel = (statut: SignalementStatut): string => {
  switch (statut) {
    case 'SIGNALE':
      return 'Signalé';
    case 'EN_COURS':
      return 'En cours';
    case 'TERMINE':
      return 'Terminé';
    case 'REJETE':
      return 'Rejeté';
    default:
      return statut;
  }
};

// Priorité badge helper
export const getPrioriteBadgeVariant = (priorite: SignalementPriorite): BadgeVariant => {
  switch (priorite) {
    case 'BASSE':
      return 'secondary';
    case 'MOYENNE':
      return 'primary';
    case 'HAUTE':
      return 'warning';
    case 'URGENTE':
      return 'danger';
    default:
      return 'secondary';
  }
};

export const getPrioriteLabel = (priorite: SignalementPriorite): string => {
  switch (priorite) {
    case 'BASSE':
      return 'Basse';
    case 'MOYENNE':
      return 'Moyenne';
    case 'HAUTE':
      return 'Haute';
    case 'URGENTE':
      return 'Urgente';
    default:
      return priorite;
  }
};
