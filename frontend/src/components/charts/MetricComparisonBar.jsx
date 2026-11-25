import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export const MetricComparisonBar = ({
  comparisons = [],
  title = 'Internal Clustering Validity Comparison Across Linkage Strategies',
  height = 320,
}) => {
  if (!comparisons || comparisons.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
        No comparison metrics available.
      </div>
    );
  }

  const chartData = comparisons.map((item) => ({
    method: item.linkage_method ? item.linkage_method.toUpperCase() : 'UNKNOWN',
    silhouette: item.silhouette_score || 0,
    daviesBouldin: item.davies_bouldin_index || 0,
    calinskiHarabaszNorm: item.calinski_harabasz_index ? item.calinski_harabasz_index / 100 : 0,
  }));

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-lg shadow-xl text-xs space-y-1 backdrop-blur-md">
          <p className="font-semibold text-white border-b border-slate-800 pb-1 mb-1">
            Linkage Method: {label}
          </p>
          {payload.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}:
              </span>
              <span className="font-mono font-medium text-white">
                {item.dataKey === 'calinskiHarabaszNorm'
                  ? (item.value * 100).toFixed(1)
                  : item.value.toFixed(4)}
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
        <p className="text-xs text-slate-400 mt-0.5">
          Evaluating Ward vs Complete vs Average vs Single linkage methods
        </p>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="method" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip content={customTooltip} />
            <Legend
              wrapperStyle={{ paddingTop: 10, fontSize: '12px' }}
              iconType="square"
            />
            <Bar
              dataKey="silhouette"
              name="Silhouette Score (Higher is better)"
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="daviesBouldin"
              name="Davies-Bouldin Index (Lower is better)"
              fill="#F59E0B"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
