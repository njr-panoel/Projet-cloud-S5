import React from 'react';
import { TrendingUp, Clock, CheckCircle, MapPin, AlertTriangle, Ruler, Banknote, BarChart3 } from 'lucide-react';
import { Card } from '../ui';
import type { GlobalStats } from '../../types';

// Fonction pour formater le budget en ariary
const formatBudget = (budget: number): string => {
  if (budget >= 1_000_000_000) {
    return `${(budget / 1_000_000_000).toFixed(1)} Mrd Ar`;
  } else if (budget >= 1_000_000) {
    return `${(budget / 1_000_000).toFixed(1)} M Ar`;
  } else if (budget >= 1_000) {
    return `${(budget / 1_000).toFixed(0)} K Ar`;
  }
  return `${budget} Ar`;
};

// Fonction pour formater la surface
const formatSurface = (surface: number): string => {
  if (surface >= 1_000_000) {
    return `${(surface / 1_000_000).toFixed(1)} km²`;
  } else if (surface >= 10_000) {
    return `${(surface / 10_000).toFixed(1)} ha`;
  }
  return `${surface.toLocaleString('fr-FR')} m²`;
};

interface StatsGlobalProps {
  stats: GlobalStats | null;
  isLoading?: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => (
  <Card className="relative overflow-hidden">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-secondary-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-secondary-800">{value}</p>
        {trend && (
          <p className="text-xs text-success-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  </Card>
);

export const StatsGlobal: React.FC<StatsGlobalProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-secondary-200 rounded w-20" />
                <div className="h-8 bg-secondary-200 rounded w-16" />
              </div>
              <div className="w-12 h-12 bg-secondary-200 rounded-lg" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Points',
      value: stats.totalSignalements,
      icon: <MapPin className="w-6 h-6 text-white" />,
      color: 'bg-primary-500',
    },
    {
      title: 'Surface Totale',
      value: formatSurface(stats.totalSurface),
      icon: <Ruler className="w-6 h-6 text-white" />,
      color: 'bg-secondary-600',
    },
    {
      title: 'Avancement',
      value: `${stats.pourcentageTermine.toFixed(1)}%`,
      icon: <BarChart3 className="w-6 h-6 text-white" />,
      color: 'bg-primary-600',
      trend: `${stats.termines} terminés sur ${stats.totalSignalements}`,
    },
    {
      title: 'Budget Total',
      value: formatBudget(stats.totalBudget),
      icon: <Banknote className="w-6 h-6 text-white" />,
      color: 'bg-success-600',
    },
    {
      title: 'En Cours',
      value: stats.enCours,
      icon: <Clock className="w-6 h-6 text-white" />,
      color: 'bg-warning-500',
    },
    {
      title: 'Nouveaux',
      value: stats.nouveau,
      icon: <AlertTriangle className="w-6 h-6 text-white" />,
      color: 'bg-danger-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
};
