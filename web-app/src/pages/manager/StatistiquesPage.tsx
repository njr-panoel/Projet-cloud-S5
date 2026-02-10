import StatistiquesAvancees from '../../components/stats/StatistiquesAvancees';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const StatistiquesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link 
              to="/manager/dashboard" 
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-secondary-800">Statistiques & Avancement</h1>
              <p className="text-secondary-500 text-sm">
                Analyse des délais de traitement et suivi d'avancement
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <StatistiquesAvancees />
      </div>
    </div>
  );
};

export default StatistiquesPage;
