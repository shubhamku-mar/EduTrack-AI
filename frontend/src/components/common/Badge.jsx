import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  const variantClasses = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700',
    primary: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    secondary: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    info: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  };

  // Automatic variant selection for risk strings
  let chosenVariant = variant;
  if (typeof children === 'string') {
    const lower = children.toLowerCase();
    if (lower.includes('high risk') || lower.includes('drop') || lower.includes('critical')) {
      chosenVariant = 'danger';
    } else if (lower.includes('moderate') || lower.includes('decline') || lower.includes('irregular')) {
      chosenVariant = 'warning';
    } else if (lower.includes('low risk') || lower.includes('consistent') || lower.includes('engaged') || lower.includes('online')) {
      chosenVariant = 'success';
    } else if (lower.includes('recovering')) {
      chosenVariant = 'primary';
    }
  }

  return (
    <span className={`${baseClasses} ${sizeClasses[size] || sizeClasses.sm} ${variantClasses[chosenVariant] || variantClasses.default} ${className}`}>
      {children}
    </span>
  );
};
