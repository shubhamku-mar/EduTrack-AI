import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

export const RiskDistributionPie = ({
  riskDistribution = {},
  title = 'Student Cohort Risk Distribution',
  height = 320,
}) => {
  const COLOR_PALETTE = {
    'Low Risk': '#10B981', // emerald
    'Moderate Risk': '#F59E0B', // amber
    'High Risk': '#EF4444', // red
    'Recovering': '#3B82F6', // blue
  };

  const chartData = Object.entries(riskDistribution).map(([name, value]) => ({
    name,
    value,
    color: COLOR_PALETTE[name] || '#6366F1',
  }));

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  if (total === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
        No risk distribution data available.
      </div>
    );
  }

  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const pct = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-lg shadow-xl text-xs space-y-1 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color }} />
            <span className="font-semibold text-white">{data.name}</span>
          </div>
          <div className="text-slate-300 font-mono">
            {data.value} students ({pct}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div>
        <h4 className="text-sm font-semibold text-white tracking-tight">{title}</h4>
        <p className="text-xs text-slate-400 mt-0.5">
          Stratification of cohort trajectories into risk archetypes
        </p>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="48%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={customTooltip} />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value, entry) => (
                <span className="text-slate-300 text-xs">
                  {value} ({entry.payload.value})
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
