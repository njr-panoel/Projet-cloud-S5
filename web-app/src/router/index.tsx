import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from '../components/auth';
import { LoginPage } from '../pages/auth/LoginPage';
import { VisiteurPage } from '../pages/visiteur/VisiteurPage';
import { SignalementPage } from '../pages/utilisateur/SignalementPage';
import { DashboardPage } from '../pages/manager/DashboardPage';
import { UsersBlockedPage } from '../pages/manager/UsersBlockedPage';
import { ManagersPage } from '../pages/manager/ManagersPage';

// Page 403 - Unauthorized
const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-danger-500 mb-4">403</h1>
      <h2 className="text-2xl font-semibold text-secondary-800 mb-2">Accès refusé</h2>
      <p className="text-secondary-600 mb-6">
        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
      </p>
      <a href="/" className="btn-primary">
        Retour à l'accueil
      </a>
    </div>
  </div>
);

// Page 404 - Not Found
const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-primary-500 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-secondary-800 mb-2">Page non trouvée</h2>
      <p className="text-secondary-600 mb-6">
        La page que vous recherchez n'existe pas.
      </p>
      <a href="/" className="btn-primary">
        Retour à l'accueil
      </a>
    </div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <VisiteurPage />,
      },
      {
        path: 'signalement',
        element: (
          <ProtectedRoute allowedRoles={['UTILISATEUR_MOBILE', 'MANAGER']}>
            <SignalementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute allowedRoles={['MANAGER']}>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users-blocked',
        element: (
          <ProtectedRoute allowedRoles={['MANAGER']}>
            <UsersBlockedPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'managers',
        element: (
          <ProtectedRoute allowedRoles={['MANAGER']}>
            <ManagersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
