import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  color = 'blue',
  badge,
  className = '',
}) => {
  const colorMap = {
    blue: {
      border: 'border-blue-500/20',
      bgGlow: 'from-blue-600/10 to-transparent',
      iconBg: 'bg-blue-500/10 text-blue-400',
    },
    indigo: {
      border: 'border-indigo-500/20',
      bgGlow: 'from-indigo-600/10 to-transparent',
      iconBg: 'bg-indigo-500/10 text-indigo-400',
    },
    emerald: {
      border: 'border-emerald-500/20',
      bgGlow: 'from-emerald-600/10 to-transparent',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
    },
    amber: {
      border: 'border-amber-500/20',
      bgGlow: 'from-amber-600/10 to-transparent',
      iconBg: 'bg-amber-500/10 text-amber-400',
    },
    rose: {
      border: 'border-rose-500/20',
      bgGlow: 'from-rose-600/10 to-transparent',
      iconBg: 'bg-rose-500/10 text-rose-400',
    },
    purple: {
      border: 'border-purple-500/20',
      bgGlow: 'from-purple-600/10 to-transparent',
      iconBg: 'bg-purple-500/10 text-purple-400',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-900/80 backdrop-blur-md border ${scheme.border} p-5 shadow-lg shadow-black/20 hover:border-slate-700 transition-all duration-300 group ${className}`}
    >
      <div className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl ${scheme.bgGlow} rounded-bl-full pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-60`} />

      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-white">
              {value}
            </h3>
            {badge && (
              <span className="text-xs px-2 py-0.5 rounded font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {badge}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-lg ${scheme.iconBg} ring-1 ring-white/10 shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="relative z-10 mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>{subtitle}</span>
          {trend && (
            <span
              className={`font-medium flex items-center gap-0.5 ${
                trendPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
