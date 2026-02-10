import { useEffect, useState } from 'react';
import { signalementService } from '../../services/signalementService';
import type { StatistiquesResponse } from '../../services/signalementService';

export default function StatistiquesAvancees() {
  const [stats, setStats] = useState<StatistiquesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await signalementService.getStatistiques();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
      console.error('Erreur chargement statistiques:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg shadow-md p-6">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadStats}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const formatDelai = (jours: number | null) => {
    if (jours === null) return '-';
    if (jours === 0) return '< 1 jour';
    if (jours === 1) return '1 jour';
    return `${Math.round(jours)} jours`;
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-MG', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0,
    }).format(montant);
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec avancement global */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-md p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">📊 Tableau de Bord Avancement</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/20 rounded-lg p-4">
            <p className="text-sm opacity-80">Avancement Global</p>
            <p className="text-4xl font-bold">{Math.round(stats.avancementMoyen)}%</p>
            <div className="w-full bg-white/30 rounded-full h-3 mt-2">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats.avancementMoyen}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <p className="text-sm opacity-80">Délai Moyen Traitement</p>
            <p className="text-3xl font-bold">{formatDelai(stats.delaiMoyenTraitement)}</p>
            <p className="text-xs opacity-70 mt-1">De nouveau à terminé</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <p className="text-sm opacity-80">Délai Moyen Prise en Charge</p>
            <p className="text-3xl font-bold">{formatDelai(stats.delaiMoyenPriseEnCharge)}</p>
            <p className="text-xs opacity-70 mt-1">De nouveau à en cours</p>
          </div>
        </div>
      </div>

      {/* Statistiques par statut */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Répartition par Statut</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-3xl font-bold text-gray-800">{stats.totalSignalements}</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
            <p className="text-sm text-orange-600">Nouveau (0%)</p>
            <p className="text-3xl font-bold text-orange-600">{stats.nouveaux}</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm text-blue-600">En Cours (50%)</p>
            <p className="text-3xl font-bold text-blue-600">{stats.enCours}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <p className="text-sm text-green-600">Terminé (100%)</p>
            <p className="text-3xl font-bold text-green-600">{stats.termines}</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
            <p className="text-sm text-red-600">Annulé</p>
            <p className="text-3xl font-bold text-red-600">{stats.annules}</p>
          </div>
        </div>
      </div>

      {/* Tableau des délais de traitement */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">⏱️ Analyse des Délais de Traitement</h3>
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Indicateur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valeur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-medium">Délai Moyen</td>
              <td className="px-6 py-4 whitespace-nowrap text-blue-600 font-bold">
                {formatDelai(stats.delaiMoyenTraitement)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                Temps moyen entre la création et la terminaison
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-medium">Délai Minimum</td>
              <td className="px-6 py-4 whitespace-nowrap text-green-600 font-bold">
                {formatDelai(stats.delaiMinTraitement)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                Traitement le plus rapide
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-medium">Délai Maximum</td>
              <td className="px-6 py-4 whitespace-nowrap text-red-600 font-bold">
                {formatDelai(stats.delaiMaxTraitement)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                Traitement le plus long
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap font-medium">Prise en Charge</td>
              <td className="px-6 py-4 whitespace-nowrap text-purple-600 font-bold">
                {formatDelai(stats.delaiMoyenPriseEnCharge)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                Temps moyen avant le début des travaux
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statistiques par type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">🔧 Par Type de Travaux</h3>
          <div className="space-y-3">
            {Object.entries(stats.parTypeTravaux).length > 0 ? (
              Object.entries(stats.parTypeTravaux).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{type.replace(/_/g, ' ')}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(count / stats.totalSignalements) * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-gray-800 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">Aucun signalement</p>
            )}
          </div>
        </div>

        {/* Budget */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">💰 Budget</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Budget Total</p>
              <p className="text-2xl font-bold text-gray-800">{formatMontant(stats.budgetTotal)}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Budget Travaux Terminés</p>
              <p className="text-xl font-bold text-green-700">{formatMontant(stats.budgetTermine)}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Budget Travaux En Cours</p>
              <p className="text-xl font-bold text-blue-700">{formatMontant(stats.budgetEnCours)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton rafraîchir */}
      <div className="text-center">
        <button
          onClick={loadStats}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Rafraîchir les Statistiques
        </button>
      </div>
    </div>
  );
}
