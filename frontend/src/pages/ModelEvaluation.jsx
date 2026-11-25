import React, { useState, useEffect } from 'react';
import {
  Gauge,
  Award,
  CheckCircle2,
  TrendingUp,
  Sliders,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { MetricComparisonBar } from '../components/charts/MetricComparisonBar';
import { api } from '../services/api';

export const ModelEvaluation = () => {
  const [comparison, setComparison] = useState(null);
  const [numClusters, setNumClusters] = useState(5);
  const [loading, setLoading] = useState(true);

  const fetchComparison = async (k = numClusters) => {
    setLoading(true);
    try {
      const res = await api.compareLinkages(k);
      setComparison(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison(5);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <Gauge className="w-5 h-5 text-blue-400" />
              Hierarchical Linkage Method Comparative Evaluation (Section G)
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Rigorous internal cluster validation comparing Ward, Complete, Average, and Single linkage methods.
              Evaluated on identical standardized longitudinal feature spaces across three mathematical indices.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Clusters (k):</span>
            <select
              value={numClusters}
              onChange={(e) => {
                const k = Number(e.target.value);
                setNumClusters(k);
                fetchComparison(k);
              }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            >
              {[2, 3, 4, 5, 6, 7, 8].map((k) => (
                <option key={k} value={k}>
                  k = {k}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Recommended Best Method Card */}
      {comparison && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border border-blue-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Empirical Recommendation
              </span>
              <span className="text-xs text-slate-400 font-mono">k = {comparison.n_clusters}</span>
            </div>
            <h4 className="text-xl font-bold text-white capitalize">
              Optimal Strategy: {comparison.best_method} Linkage
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {comparison.explanation}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 shrink-0 space-y-2 text-xs">
            <div className="text-slate-400 font-medium">Metric Targets:</div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-slate-300">Silhouette: Maximize toward +1.0</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-slate-300">Davies-Bouldin: Minimize toward 0.0</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-300">Calinski-Harabasz: Maximize ratio</span>
            </div>
          </div>
        </div>
      )}

      {/* Comparative Bar Chart */}
      <MetricComparisonBar
        comparisons={comparison?.linkage_comparisons || []}
        title="Linkage Methods Metric Comparison (Silhouette Score & Davies-Bouldin Index)"
        height={320}
      />

      {/* Side-by-Side Detailed Comparison Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Full Comparative Metrics Matrix</h4>
          <p className="text-xs text-slate-400">
            Internal validity indices and cluster distribution balance across each agglomerative strategy
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold text-[10px] uppercase">
              <tr>
                <th className="py-3 px-4">Linkage Strategy</th>
                <th className="py-3 px-4">Silhouette Score</th>
                <th className="py-3 px-4">Davies-Bouldin</th>
                <th className="py-3 px-4">Calinski-Harabasz</th>
                <th className="py-3 px-4">Cluster Distribution</th>
                <th className="py-3 px-4">Balance Entropy</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="py-3 px-4">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  </tr>
                ))
              ) : comparison?.linkage_comparisons?.map((m) => {
                const isOptimal = m.linkage_method.toLowerCase() === comparison.best_method.toLowerCase();
                return (
                  <tr
                    key={m.linkage_method}
                    className={`hover:bg-slate-800/40 ${
                      isOptimal ? 'bg-blue-950/20 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-sans font-bold capitalize text-white flex items-center gap-2">
                      {isOptimal && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {m.linkage_method}
                    </td>
                    <td className="py-3 px-4 text-blue-400 font-bold">
                      {m.silhouette_score?.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 text-amber-400 font-bold">
                      {m.davies_bouldin_index?.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 text-emerald-400">
                      {m.calinski_harabasz_index?.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      [{m.cluster_distribution?.join(', ')}]
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {m.cluster_balance_entropy?.toFixed(3)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isOptimal ? (
                        <Badge variant="success" size="xs">
                          Optimal
                        </Badge>
                      ) : (
                        <Badge variant="default" size="xs">
                          Sub-optimal
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
