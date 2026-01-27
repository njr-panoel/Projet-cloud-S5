import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Map } from 'lucide-react';
import { Card } from '../../components/ui';
import { LoginForm, RegisterForm } from '../../components/auth';

type AuthMode = 'login' | 'register';

export const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  const handleSuccess = () => {
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <Map className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-secondary-800">
            Suivi Travaux Routiers
          </h1>
          <p className="text-secondary-600 mt-1">Antananarivo</p>
        </div>

        {/* Auth Card */}
        <Card className="animate-fade-in">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-secondary-800">
              {mode === 'login' ? 'Connexion' : 'Créer un compte'}
            </h2>
            <p className="text-secondary-500 text-sm mt-1">
              {mode === 'login'
                ? 'Connectez-vous pour accéder à votre espace'
                : 'Inscrivez-vous pour signaler des travaux'}
            </p>
          </div>

          {mode === 'login' ? (
            <LoginForm
              onSuccess={handleSuccess}
              onRegisterClick={() => setMode('register')}
            />
          ) : (
            <RegisterForm
              onSuccess={handleSuccess}
              onLoginClick={() => setMode('login')}
            />
          )}
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-secondary-500 mt-6">
          © 2026 Mairie d'Antananarivo - Tous droits réservés
        </p>
      </div>
    </div>
  );
};
