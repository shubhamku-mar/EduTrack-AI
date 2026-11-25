import React, { useState, useEffect } from 'react';
import {
  GitFork,
  Play,
  Download,
  Gauge,
  Sliders,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { DendrogramChart } from '../components/charts/DendrogramChart';
import { useToast } from '../components/common/Toast';
import { api } from '../services/api';

export const HierarchicalClustering = ({ onNavigate }) => {
  const [linkageMethod, setLinkageMethod] = useState('ward');
  const [numClusters, setNumClusters] = useState(5);
  const [running, setRunning] = useState(false);
  const [clusteringResult, setClusteringResult] = useState(null);
  const [studentsList, setStudentsList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const { addToast } = useToast();

  const executeClustering = async (link = linkageMethod, k = numClusters) => {
    setRunning(true);
    try {
      const res = await api.runClustering({
        linkage_method: link,
        n_clusters: k,
      });
      setClusteringResult(res);
      addToast(
        `Clustering executed with ${link.toUpperCase()} linkage (k=${k}). Silhouette: ${res.silhouette}`,
        'success'
      );
      // Fetch updated student assignments
      await fetchAssignedStudents();
    } catch (err) {
      addToast(`Clustering failed: ${err.message}`, 'error');
    } finally {
      setRunning(false);
    }
  };

  const fetchAssignedStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await api.getStudents({ limit: 50 });
      setStudentsList(res.students || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    executeClustering('ward', 5);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Parameters & Execution Control Panel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <GitFork className="w-5 h-5 text-blue-400" />
              Agglomerative Hierarchical Clustering (Objective 2)
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Clusters multi-dimensional longitudinal trajectory vectors using hierarchical agglomeration.
              Supports Ward's minimum variance, Complete, Average, and Single linkage strategies.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Gauge}
              onClick={() => onNavigate('evaluation')}
            >
              Compare All Linkages
            </Button>
          </div>
        </div>

        {/* Hyperparameters Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
          {/* Linkage Method Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span>Linkage Method:</span>
            </label>
            <select
              value={linkageMethod}
              onChange={(e) => setLinkageMethod(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="ward">Ward Linkage (Minimum Variance - Recommended)</option>
              <option value="complete">Complete Linkage (Maximum Pairwise Distance)</option>
              <option value="average">Average Linkage (UPGMA Mean Distance)</option>
              <option value="single">Single Linkage (Minimum Pairwise Distance)</option>
            </select>
            <p className="text-[11px] text-slate-500">
              Ward minimizes within-cluster variance; Complete bounds cluster diameters.
            </p>
          </div>

          {/* Number of Clusters Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Number of Clusters (k):</span>
              <span className="font-mono text-blue-400 font-bold text-sm">{numClusters}</span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              step="1"
              value={numClusters}
              onChange={(e) => setNumClusters(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>k=2</span>
              <span>k=3</span>
              <span>k=4</span>
              <span>k=5</span>
              <span>k=6</span>
              <span>k=7</span>
              <span>k=8</span>
            </div>
          </div>

          {/* Execute Button */}
          <div className="flex flex-col justify-end">
            <Button
              variant="accent"
              size="md"
              icon={Play}
              loading={running}
              onClick={() => executeClustering()}
              className="w-full"
            >
              Execute Hierarchical Clustering
            </Button>
          </div>
        </div>
      </div>

      {/* Internal Validity Metrics Banner */}
      {clusteringResult && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Silhouette Score</span>
              <span className="text-[11px] text-blue-400">(-1 to +1, Higher better)</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {clusteringResult.silhouette?.toFixed(4)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Measures trajectory compactness and inter-cluster separation
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Davies-Bouldin Index</span>
              <span className="text-[11px] text-amber-400">(Lower is better)</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {clusteringResult.davies_bouldin?.toFixed(4)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Cluster dispersion vs separation ratio
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Calinski-Harabasz Score</span>
              <span className="text-[11px] text-emerald-400">(Higher is better)</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {clusteringResult.calinski_harabasz?.toFixed(1)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Variance ratio criterion across feature dimensions
            </p>
          </div>
        </div>
      )}

      {/* Interactive Dendrogram Visualization */}
      <DendrogramChart
        dendrogramData={clusteringResult?.dendrogram_data}
        title={`Agglomerative Clustering Dendrogram (${linkageMethod.toUpperCase()} Linkage, k=${numClusters})`}
        height={400}
      />

      {/* Discovered Cluster Distribution Cards */}
      {clusteringResult?.cluster_profiles && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">Discovered Cluster Cohorts</h4>
              <p className="text-xs text-slate-400">
                Segmented trajectories with dynamic statistical profile labels
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              icon={ArrowRight}
              onClick={() => onNavigate('trajectories')}
            >
              Deep Trajectory Analysis
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(clusteringResult.cluster_profiles).map((prof) => (
              <div
                key={prof.cluster_id}
                className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Cluster {prof.cluster_id}
                  </span>
                  <Badge size="xs">{prof.risk_category}</Badge>
                </div>

                <div>
                  <h5 className="text-sm font-bold text-white">{prof.profile_label}</h5>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {prof.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Students:</span>
                    <p className="font-semibold text-white">
                      {prof.student_count} ({prof.percentage_of_cohort}%)
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Att. Slope:</span>
                    <p className="font-mono font-semibold text-white">
                      {prof.metrics.attendance_slope} %/wk
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Cluster Assignment Sample Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-white">Student Cluster Assignments (Sample)</h4>
            <p className="text-xs text-slate-400">
              Individual assignments generated by the current hierarchical run
            </p>
          </div>
          <a
            href={api.downloadCsvUrl}
            download="clustering_assignments.csv"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            Download Full Assignments CSV
          </a>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Student ID</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Assigned Cluster</th>
                <th className="py-2.5 px-3">Profile Label</th>
                <th className="py-2.5 px-3">Risk Category</th>
                <th className="py-2.5 px-3">Att. Slope</th>
                <th className="py-2.5 px-3">Grade Slope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loadingStudents ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="py-3 px-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  </tr>
                ))
              ) : studentsList.slice(0, 15).map((s) => (
                <tr key={s.student_id} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-mono font-medium text-blue-400">{s.student_id}</td>
                  <td className="py-2 px-3 text-white font-medium">{s.name}</td>
                  <td className="py-2 px-3 font-mono">Cluster {s.cluster_id}</td>
                  <td className="py-2 px-3">{s.profile_label}</td>
                  <td className="py-2 px-3">
                    <Badge size="xs">{s.risk_category}</Badge>
                  </td>
                  <td className="py-2 px-3 font-mono">{s.attendance_slope?.toFixed(2)}</td>
                  <td className="py-2 px-3 font-mono">{s.grade_slope?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
