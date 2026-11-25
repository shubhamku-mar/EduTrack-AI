import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  UserX,
  UserCheck,
  TrendingUp,
  FileCheck,
  Info,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { StatCard } from '../components/common/StatCard';
import { Skeleton } from '../components/common/Skeleton';
import { api } from '../services/api';

export const OutcomeValidation = () => {
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchValidation = async () => {
    setLoading(true);
    try {
      const res = await api.validateHistoricalOutcomes();
      setValidation(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValidation();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              Historical Outcome Validation (Objective 3)
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Validates discovered unsupervised trajectory clusters against ground-truth historical dropout records.
              Measures how accurately high-risk trajectories correspond to real academic crisis events.
            </p>
          </div>
          <Badge variant="primary" size="md">
            Task 3 Validation
          </Badge>
        </div>

        {/* Prominent Methodological Integrity Banner */}
        <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-start gap-3 text-xs text-blue-200">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white">Strict Unsupervised Separation:</span>
            <p className="text-blue-300/90 leading-relaxed">
              As required by the project specifications, the ground-truth feature{' '}
              <code className="px-1.5 py-0.5 rounded bg-blue-900/60 font-mono text-white text-[11px]">
                historical_dropout_status
              </code>{' '}
              was strictly withheld from the agglomerative clustering algorithm. It is evaluated exclusively
              post-hoc to demonstrate external validity.
            </p>
          </div>
        </div>
      </div>

      {/* Validation Performance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Dropout Sensitivity"
          value={validation?.metrics?.sensitivity ? `${validation.metrics.sensitivity}%` : '0%'}
          subtitle="True positive dropout capture rate"
          icon={CheckCircle2}
          color="emerald"
          badge="High Risk Clusters"
        />
        <StatCard
          title="Retention Specificity"
          value={validation?.metrics?.specificity ? `${validation.metrics.specificity}%` : '0%'}
          subtitle="True negative non-dropout retention"
          icon={UserCheck}
          color="blue"
          badge="Low Risk Clusters"
        />
        <StatCard
          title="Predictive Precision"
          value={validation?.metrics?.precision ? `${validation.metrics.precision}%` : '0%'}
          subtitle="Positive predictive value"
          icon={Award}
          color="indigo"
        />
        <StatCard
          title="Historical Dropouts"
          value={validation?.overall_dropout_count || 0}
          subtitle={`Cohort dropout rate: ${validation?.overall_dropout_rate || 0}%`}
          icon={UserX}
          color="rose"
        />
      </div>

      {/* Cluster-wise Outcome Comparison Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Cluster-wise Historical Outcome Breakdown</h4>
          <p className="text-xs text-slate-400">
            Cross-tabulation of discovered trajectory profiles with actual historical dropout cases
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold text-[10px] uppercase">
              <tr>
                <th className="py-3 px-4">Cluster</th>
                <th className="py-3 px-4">Trajectory Profile</th>
                <th className="py-3 px-4">Risk Category</th>
                <th className="py-3 px-4">Total Students</th>
                <th className="py-3 px-4">Historical Dropouts</th>
                <th className="py-3 px-4">Dropout Rate</th>
                <th className="py-3 px-4">Continued Enrolment</th>
                <th className="py-3 px-4">Retention Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="py-3 px-4">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  </tr>
                ))
              ) : validation?.clusters?.map((c) => {
                const isHigh = c.risk_category === 'High Risk';
                return (
                  <tr
                    key={c.cluster_id}
                    className={`hover:bg-slate-800/40 ${
                      isHigh ? 'bg-rose-950/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-white">C{c.cluster_id}</td>
                    <td className="py-3 px-4 font-sans font-medium text-white">{c.profile_label}</td>
                    <td className="py-3 px-4">
                      <Badge size="xs">{c.risk_category}</Badge>
                    </td>
                    <td className="py-3 px-4">{c.total_students}</td>
                    <td className="py-3 px-4 font-bold text-rose-400">{c.dropout_count}</td>
                    <td className="py-3 px-4">
                      <span className={c.dropout_percentage > 50 ? 'text-rose-400 font-bold' : ''}>
                        {c.dropout_percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      {c.continued_enrolment_count}
                    </td>
                    <td className="py-3 px-4 text-emerald-400">
                      {c.continued_enrolment_percentage}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contingency Matrix & Analytical Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contingency / Confusion Matrix */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-white">Validation Contingency Matrix</h4>
            <p className="text-xs text-slate-400">
              At-Risk Trajectory Clusters vs Historical Dropout Truth
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-emerald-500/30">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">True Positives</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {validation?.metrics?.true_positives || 0}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                At-Risk Cluster & Historical Dropout
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-amber-500/30">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">False Positives</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {validation?.metrics?.false_positives || 0}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                At-Risk Cluster & Retained Student
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-rose-500/30">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">False Negatives</span>
              <p className="text-2xl font-bold text-rose-400 mt-1">
                {validation?.metrics?.false_negatives || 0}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Low-Risk Cluster & Historical Dropout
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-blue-500/30">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">True Negatives</span>
              <p className="text-2xl font-bold text-blue-400 mt-1">
                {validation?.metrics?.true_negatives || 0}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Low-Risk Cluster & Retained Student
              </p>
            </div>
          </div>
        </div>

        {/* Analytical Validation Findings */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-white">Analytical Findings & Observations</h4>
            <p className="text-xs text-slate-400">
              Key statistical takeaways from unsupervised trajectory outcome mapping
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {validation?.insights?.map((insight, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300 leading-relaxed">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
