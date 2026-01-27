import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { checkAuth, token } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          await checkAuth();
        } catch {
          // Token invalid, will be handled by the store
        }
      }
      setIsInitialized(true);
    };

    initAuth();
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-secondary-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
