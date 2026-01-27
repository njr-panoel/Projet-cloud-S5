import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Map, 
  FileText, 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Menu, 
  X,
  User
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import type { UserRole } from '../types';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  { path: '/', label: 'Carte', icon: <Map className="w-5 h-5" /> },
  { 
    path: '/signalement', 
    label: 'Signaler', 
    icon: <FileText className="w-5 h-5" />,
    roles: ['UTILISATEUR', 'MANAGER', 'ADMIN']
  },
  { 
    path: '/dashboard', 
    label: 'Dashboard', 
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['MANAGER', 'ADMIN']
  },
  { 
    path: '/users-blocked', 
    label: 'Utilisateurs bloqués', 
    icon: <Users className="w-5 h-5" />,
    roles: ['MANAGER', 'ADMIN']
  },
];

export const MainLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    if (!isAuthenticated || !user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-600 rounded-lg">
                <Map className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-secondary-800 hidden sm:block">
                Travaux Routiers
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {filteredNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-800'
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-secondary-800">
                      {user.prenom} {user.nom}
                    </p>
                    <p className="text-xs text-secondary-500">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-secondary-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                    title="Déconnexion"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <NavLink
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Connexion
                </NavLink>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-secondary-200 bg-white animate-slide-up">
            <div className="px-4 py-3 space-y-1">
              {filteredNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-secondary-600 hover:bg-secondary-50'
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};
