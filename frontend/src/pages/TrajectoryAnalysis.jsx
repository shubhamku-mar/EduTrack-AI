import React, { useState, useEffect } from 'react';
import {
  TrendingDown,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { api } from '../services/api';

export const TrajectoryAnalysis = ({ onNavigate }) => {
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await api.getTrajectoryProfiles();
      setProfiles(res.cluster_profiles || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const profileList = Object.values(profiles);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Overview Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-blue-400" />
              Empirical At-Risk Trajectory Archetypes (Section F)
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Interpretable trajectory profiles are derived dynamically from empirical cluster centroids
              (trend slopes, variance, late drops). No clusters are hardcoded.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={ArrowRight}
            onClick={() => onNavigate('validation')}
          >
            Validate With Historical Dropouts
          </Button>
        </div>
      </div>

      {/* Trajectory Profiles Detailed Cards */}
      <div className="space-y-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))
        ) : profileList.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-900/80 rounded-xl border border-slate-800">
            No trajectory profiles found. Please execute clustering first.
          </div>
        ) : (
          profileList.map((prof) => {
            const isHighRisk = prof.risk_category === 'High Risk';
            const isModerate = prof.risk_category === 'Moderate Risk';
            const isRecovering = prof.risk_category === 'Recovering';

            return (
              <div
                key={prof.cluster_id}
                className={`p-6 rounded-2xl bg-slate-900/90 border transition-all duration-300 shadow-xl ${
                  isHighRisk
                    ? 'border-rose-500/30 shadow-rose-950/20'
                    : isModerate
                    ? 'border-amber-500/30 shadow-amber-950/20'
                    : isRecovering
                    ? 'border-blue-500/30 shadow-blue-950/20'
                    : 'border-emerald-500/30 shadow-emerald-950/20'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-white">
                      C{prof.cluster_id}
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        {prof.profile_label}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">{prof.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">
                      {prof.student_count} students ({prof.percentage_of_cohort}%)
                    </span>
                    <Badge size="md">{prof.risk_category}</Badge>
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 py-4 text-xs">
                  <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                    <span className="text-slate-400">Mean Attendance</span>
                    <p className="text-base font-bold text-white mt-1">
                      {prof.metrics.mean_attendance}%
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                    <span className="text-slate-400">Attendance Slope</span>
                    <p
                      className={`text-base font-bold mt-1 font-mono ${
                        prof.metrics.attendance_slope < -1.0 ? 'text-rose-400' : 'text-slate-100'
                      }`}
                    >
                      {prof.metrics.attendance_slope} %/wk
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                    <span className="text-slate-400">Mean Grade</span>
                    <p className="text-base font-bold text-white mt-1">{prof.metrics.mean_grade}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                    <span className="text-slate-400">Grade Slope</span>
                    <p
                      className={`text-base font-bold mt-1 font-mono ${
                        prof.metrics.grade_slope < -1.0 ? 'text-rose-400' : 'text-slate-100'
                      }`}
                    >
                      {prof.metrics.grade_slope} pts/wk
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                    <span className="text-slate-400">Late Drop (Att.)</span>
                    <p className="text-base font-bold text-white mt-1">
                      {prof.metrics.attendance_late_drop}%
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                    <span className="text-slate-400">Late Drop (Grade)</span>
                    <p className="text-base font-bold text-white mt-1">
                      {prof.metrics.grade_late_drop} pts
                    </p>
                  </div>
                </div>

                {/* Institutional Action & Recommendation Banner */}
                <div className="mt-2 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-300">Actionable Intervention:</span>
                    <span className="text-slate-400">{prof.recommendation}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onNavigate('students')}
                  >
                    View Students in C{prof.cluster_id} →
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
