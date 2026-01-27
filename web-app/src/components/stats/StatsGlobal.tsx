import React from 'react';
import { TrendingUp, Clock, CheckCircle, MapPin, DollarSign, Percent } from 'lucide-react';
import { Card } from '../ui';
import type { GlobalStats } from '../../types';

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

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M Ar`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K Ar`;
    }
    return `${value} Ar`;
  };

  const formatSurface = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K m²`;
    }
    return `${value} m²`;
  };

  const statCards = [
    {
      title: 'Total Signalements',
      value: stats.totalSignalements,
      icon: <MapPin className="w-6 h-6 text-white" />,
      color: 'bg-primary-500',
    },
    {
      title: 'En Cours',
      value: stats.enCours,
      icon: <Clock className="w-6 h-6 text-white" />,
      color: 'bg-warning-500',
    },
    {
      title: 'Terminés',
      value: stats.termines,
      icon: <CheckCircle className="w-6 h-6 text-white" />,
      color: 'bg-success-500',
    },
    {
      title: 'Surface Totale',
      value: formatSurface(stats.surfaceTotale),
      icon: <MapPin className="w-6 h-6 text-white" />,
      color: 'bg-secondary-500',
    },
    {
      title: 'Budget Total',
      value: formatCurrency(stats.budgetTotal),
      icon: <DollarSign className="w-6 h-6 text-white" />,
      color: 'bg-danger-500',
    },
    {
      title: 'Taux Achèvement',
      value: `${stats.pourcentageTermine.toFixed(1)}%`,
      icon: <Percent className="w-6 h-6 text-white" />,
      color: 'bg-success-600',
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
