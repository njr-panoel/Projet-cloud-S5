import { toast, type ToastOptions } from 'react-toastify';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import React from 'react';

const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

const ToastIcon: React.FC<{ Icon: React.ElementType; className: string }> = ({ Icon, className }) => (
  <Icon className={`w-5 h-5 ${className}`} />
);

export const Toast = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, {
      ...defaultOptions,
      ...options,
      icon: <ToastIcon Icon={CheckCircle} className="text-success-500" />,
    });
  },

  error: (message: string, options?: ToastOptions) => {
    toast.error(message, {
      ...defaultOptions,
      ...options,
      icon: <ToastIcon Icon={XCircle} className="text-danger-500" />,
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    toast.warning(message, {
      ...defaultOptions,
      ...options,
      icon: <ToastIcon Icon={AlertCircle} className="text-warning-500" />,
    });
  },

  info: (message: string, options?: ToastOptions) => {
    toast.info(message, {
      ...defaultOptions,
      ...options,
      icon: <ToastIcon Icon={Info} className="text-primary-500" />,
    });
  },
};
