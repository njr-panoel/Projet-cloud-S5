import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '../ui';
import { useAuthStore } from '../../stores/authStore';
import { Toast } from '../ui/Toast';
import type { LoginRequest } from '../../types';

const loginSchema = z.object({
  email: z.string().email('Email invalide').min(1, 'Email requis'),
  password: z.string().min(6, 'Mot de passe minimum 6 caractères'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onRegisterClick?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onRegisterClick }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const loginData: LoginRequest = {
        email: data.email,
        password: data.password,
        useFirebase: false,
      };
      await login(loginData);
      
      // Vérifier le rôle de l'utilisateur
      const user = useAuthStore.getState().user;
      if (user?.role === 'UTILISATEUR_MOBILE') {
        Toast.error('Accès refusé : Les utilisateurs mobiles ne peuvent pas accéder à cette application');
        // Déconnecter l'utilisateur
        useAuthStore.getState().logout();
        return;
      }
      
      Toast.success('Connexion réussie !');
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur de connexion';
      Toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Input
          id="email"
          {...register('email')}
          type="email"
          label="Adresse email"
          placeholder="votre@email.com"
          error={errors.email?.message}
          leftIcon={<Mail className="w-5 h-5" />}
          autoComplete="email"
        />
      </div>

      <div>
        <Input
          id="password"
          {...register('password')}
          type={showPassword ? 'text' : 'password'}
          label="Mot de passe"
          placeholder="••••••••"
          error={errors.password?.message}
          leftIcon={<Lock className="w-5 h-5" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="cursor-pointer hover:text-secondary-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          }
          autoComplete="current-password"
        />
      </div>

      <div className="flex items-center justify-between">
        <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-secondary-600">Se souvenir de moi</span>
        </label>
        <a href="#" className="text-sm text-primary-600 hover:text-primary-700">
          Mot de passe oublié ?
        </a>
      </div>

      <Button type="submit" fullWidth isLoading={isLoading}>
        Se connecter
      </Button>

      {onRegisterClick && (
        <p className="text-center text-sm text-secondary-600">
          Pas encore de compte ?{' '}
          <button
            type="button"
            onClick={onRegisterClick}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            S'inscrire
          </button>
        </p>
      )}
    </form>
  );
};
