import React from 'react';

export const Skeleton = ({ className = '', variant = 'text' }) => {
  const base = 'animate-pulse bg-slate-800/80 rounded';
  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    card: 'h-32 w-full rounded-xl',
    circle: 'h-10 w-10 rounded-full',
  };

  return <div className={`${base} ${variants[variant] || ''} ${className}`} />;
};
