import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  CheckCircle2,
  RefreshCw,
  Table as TableIcon,
  Calculator,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { useToast } from '../components/common/Toast';
import { api } from '../services/api';

export const DataPreprocessing = ({ onNavigate }) => {
  const [handleMissing, setHandleMissing] = useState('median');
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [clipOutliers, setClipOutliers] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [report, setReport] = useState(null);
  const [features, setFeatures] = useState([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);
  const { addToast } = useToast();

  const loadFeatures = async () => {
    setLoadingFeatures(true);
    try {
      const res = await api.getExtractedFeatures(25);
      setFeatures(res.features || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFeatures(false);
    }
  };

  useEffect(() => {
    loadFeatures();
  }, []);

  const handlePreprocess = async () => {
    setProcessing(true);
    try {
      const res = await api.preprocessDataset({
        handle_missing: handleMissing,
        remove_duplicates: removeDuplicates,
        clip_outliers: clipOutliers,
      });
      setReport(res.cleaning_report);
      addToast('Data preprocessed & longitudinal features extracted successfully!', 'success');
      await loadFeatures();
    } catch (err) {
      addToast(`Preprocessing failed: ${err.message}`, 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Configuration & Execution Panel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-400" />
            Longitudinal Data Preprocessing & Feature Engineering (Objective 1)
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Clean weekly records, impute missing entries, remove duplicates, and compile student-level
            trajectory features: OLS linear trend slopes ($\Delta / \text{wk}$), late-term drops, and volatility.
          </p>
        </div>

        {/* Configuration Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 border-t border-slate-800">
          {/* Missing Values Strategy */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Missing Value Imputation:
            </label>
            <select
              value={handleMissing}
              onChange={(e) => setHandleMissing(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="median">Median Imputation (Recommended)</option>
              <option value="mean">Mean Imputation</option>
              <option value="drop">Drop Incomplete Rows</option>
            </select>
            <p className="text-[11px] text-slate-500">
              Median preserves skewed attendance without shifting distribution
            </p>
          </div>

          {/* Deduplication Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Deduplication:
            </label>
            <div className="flex items-center gap-2 pt-1.5">
              <input
                type="checkbox"
                id="dedup"
                checked={removeDuplicates}
                onChange={(e) => setRemoveDuplicates(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="dedup" className="text-xs text-slate-300 cursor-pointer">
                Drop duplicate (student_id, week) records
              </label>
            </div>
            <p className="text-[11px] text-slate-500">
              Enforces exactly one weekly observation per student
            </p>
          </div>

          {/* Outlier Capping */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Domain Capping & Outliers:
            </label>
            <div className="flex items-center gap-2 pt-1.5">
              <input
                type="checkbox"
                id="outlier"
                checked={clipOutliers}
                onChange={(e) => setClipOutliers(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="outlier" className="text-xs text-slate-300 cursor-pointer">
                Clip 1st/99th percentiles & bound [0, 100]
              </label>
            </div>
            <p className="text-[11px] text-slate-500">
              Restricts percentages to 0-100% and caps extreme LMS login spikes
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Standardization: <span className="font-mono text-blue-400">StandardScaler (z = (x - μ) / σ)</span>
          </div>
          <Button
            variant="primary"
            icon={Sparkles}
            loading={processing}
            onClick={handlePreprocess}
          >
            Execute Preprocessing & Feature Extraction
          </Button>
        </div>
      </div>

      {/* Diagnostics Report Banner if executed */}
      {report && (
        <div className="p-5 rounded-xl bg-slate-900/90 border border-emerald-500/30 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Preprocessing Pipeline Diagnostics
            </h4>
            <Badge variant="success">Completed</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
              <span className="text-slate-400">Initial Rows:</span>
              <p className="text-base font-bold text-white mt-0.5">{report.initial_rows}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
              <span className="text-slate-400">Duplicates Removed:</span>
              <p className="text-base font-bold text-white mt-0.5">{report.duplicates_removed}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
              <span className="text-slate-400">Missing Values Imputed:</span>
              <p className="text-base font-bold text-white mt-0.5">{report.missing_imputed}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
              <span className="text-slate-400">Final Clean Records:</span>
              <p className="text-base font-bold text-emerald-400 mt-0.5">{report.final_rows}</p>
            </div>
          </div>
        </div>
      )}

      {/* Compiled Student Longitudinal Features Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-400" />
              Compiled Student Trajectory Features (First 25 Students)
            </h4>
            <p className="text-xs text-slate-400">
              Aggregated longitudinal vectors prepared for Agglomerative Hierarchical Clustering
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            icon={ArrowRight}
            onClick={() => onNavigate('clustering')}
          >
            Proceed to Clustering
          </Button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Student ID</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Avg Att.</th>
                <th className="py-2.5 px-3">Att. Slope</th>
                <th className="py-2.5 px-3">Att. Late Drop</th>
                <th className="py-2.5 px-3">Avg Grade</th>
                <th className="py-2.5 px-3">Grade Slope</th>
                <th className="py-2.5 px-3">Grade Late Drop</th>
                <th className="py-2.5 px-3">Avg Engagement</th>
                <th className="py-2.5 px-3">Sub. Decline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {loadingFeatures ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={10} className="py-3 px-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  </tr>
                ))
              ) : features.map((f) => (
                <tr key={f.student_id} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-blue-400 font-semibold">{f.student_id}</td>
                  <td className="py-2 px-3 font-sans font-medium text-white">{f.name}</td>
                  <td className="py-2 px-3">{f.mean_attendance}%</td>
                  <td className="py-2 px-3">
                    <span className={f.attendance_slope < -1.0 ? 'text-rose-400 font-bold' : ''}>
                      {f.attendance_slope}
                    </span>
                  </td>
                  <td className="py-2 px-3">{f.attendance_late_drop}%</td>
                  <td className="py-2 px-3">{f.mean_grade}%</td>
                  <td className="py-2 px-3">
                    <span className={f.grade_slope < -1.0 ? 'text-rose-400 font-bold' : ''}>
                      {f.grade_slope}
                    </span>
                  </td>
                  <td className="py-2 px-3">{f.grade_late_drop}%</td>
                  <td className="py-2 px-3">{f.mean_engagement}</td>
                  <td className="py-2 px-3">{f.submission_rate_decline}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
