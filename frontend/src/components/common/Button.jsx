import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30 focus:ring-blue-500 border border-blue-500/30',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 focus:ring-slate-500',
    accent: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-indigo-900/30 focus:ring-indigo-500',
    outline: 'bg-transparent hover:bg-slate-800/60 text-slate-300 border border-slate-700 hover:border-slate-600 focus:ring-slate-500',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-100 focus:ring-slate-500 shadow-none',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500 border border-rose-500/30',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-500 border border-emerald-500/30',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
};
