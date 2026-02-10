import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Phone, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button, Input } from '../ui';
import { useAuthStore } from '../../stores/authStore';
import { Toast } from '../ui/Toast';

const registerSchema = z.object({
  nom: z.string().min(2, 'Nom minimum 2 caractères'),
  prenom: z.string().min(2, 'Prénom minimum 2 caractères'),
  email: z.string().email('Email invalide').min(1, 'Email requis'),
  telephone: z.string().optional(),
  password: z.string().min(6, 'Mot de passe minimum 6 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onLoginClick }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const { register: registerUser, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        nom: data.nom,
        prenom: data.prenom,
        telephone: data.telephone,
        role: 'UTILISATEUR_MOBILE',
      });
      setIsRegistered(true);
      Toast.success('Compte créé avec succès !');
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de l\'inscription';
      Toast.error(message);
    }
  };

  if (isRegistered) {
    return (
      <div className="text-center py-8 animate-fade-in">
        <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-success-600" />
        </div>
        <h3 className="text-xl font-semibold text-secondary-800 mb-2">
          Inscription réussie !
        </h3>
        <p className="text-secondary-600 mb-4">
          Votre compte a été créé avec succès. Vous allez être redirigé...
        </p>
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="nom"
          {...register('nom')}
          label="Nom"
          placeholder="Rakoto"
          error={errors.nom?.message}
          leftIcon={<User className="w-5 h-5" />}
        />
        <Input
          id="prenom"
          {...register('prenom')}
          label="Prénom"
          placeholder="Jean"
          error={errors.prenom?.message}
          leftIcon={<User className="w-5 h-5" />}
        />
      </div>

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

      <Input
        id="telephone"
        {...register('telephone')}
        type="tel"
        label="Téléphone (optionnel)"
        placeholder="+261 34 00 000 00"
        error={errors.telephone?.message}
        leftIcon={<Phone className="w-5 h-5" />}
      />

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
        autoComplete="new-password"
      />

      <Input
        id="confirmPassword"
        {...register('confirmPassword')}
        type={showConfirmPassword ? 'text' : 'password'}
        label="Confirmer le mot de passe"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        leftIcon={<Lock className="w-5 h-5" />}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="cursor-pointer hover:text-secondary-600"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        }
        autoComplete="new-password"
      />

      <Button type="submit" fullWidth isLoading={isLoading}>
        Créer un compte
      </Button>

      {onLoginClick && (
        <p className="text-center text-sm text-secondary-600">
          Déjà un compte ?{' '}
          <button
            type="button"
            onClick={onLoginClick}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Se connecter
          </button>
        </p>
      )}
    </form>
  );
};
