import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export const TrajectoryTrendChart = ({
  data = [],
  title = 'Longitudinal Cohort Trajectory Trends (Weeks 1 to 16)',
  subtitle = 'Weekly progression across attendance, academic score, and LMS engagement',
  height = 320,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
        No longitudinal time-series data available.
      </div>
    );
  }

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-lg shadow-xl text-xs space-y-1 backdrop-blur-md">
          <p className="font-semibold text-white border-b border-slate-800 pb-1 mb-1">
            Academic Week {label}
          </p>
          {payload.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}:
              </span>
              <span className="font-mono font-medium text-white">
                {typeof item.value === 'number' ? item.value.toFixed(1) : item.value}
                {item.name.includes('Attendance') || item.name.includes('Score') || item.name.includes('Grade') ? '%' : ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-white tracking-tight">{title}</h4>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="week"
              stroke="#64748b"
              fontSize={11}
              tickFormatter={(w) => `W${w}`}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={customTooltip} />
            <Legend
              wrapperStyle={{ paddingTop: 10, fontSize: '12px' }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="avg_attendance"
              name="Attendance Rate"
              stroke="#3B82F6"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#3B82F6' }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="avg_grade"
              name="Assessment Grade"
              stroke="#10B981"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#10B981' }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="avg_engagement"
              name="Composite Engagement"
              stroke="#8B5CF6"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 2.5, fill: '#8B5CF6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
