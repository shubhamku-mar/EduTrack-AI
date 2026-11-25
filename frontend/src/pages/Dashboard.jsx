import React, { useState, useEffect } from 'react';
import {
  Users,
  CalendarCheck,
  Award,
  AlertTriangle,
  UserX,
  TrendingUp,
  Activity,
  ArrowRight,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { TrajectoryTrendChart } from '../components/charts/TrajectoryTrendChart';
import { RiskDistributionPie } from '../components/charts/RiskDistributionPie';
import { ClusterScatterChart } from '../components/charts/ClusterScatterChart';
import { api } from '../services/api';

export const Dashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, studentsData] = await Promise.all([
        api.getDashboardStats(),
        api.getStudents({ limit: 300 }),
      ]);
      setStats(statsData);
      setStudents(studentsData.students || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-xl bg-rose-950/40 border border-rose-500/30 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-lg font-semibold text-white">Failed to Load Dashboard</h3>
        <p className="text-sm text-rose-300 max-w-md mx-auto">{error}</p>
        <Button onClick={fetchDashboardData} variant="outline" size="sm">
          Retry
        </Button>
      </div>
    );
  }

  const atRiskPct = stats?.total_students
    ? ((stats.at_risk_students / stats.total_students) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Project Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/60 to-slate-900 border border-blue-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">
                Project SIH26037
              </Badge>
              <span className="text-xs text-slate-400 font-mono">Lovely Professional University</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Hierarchical Clustering of Longitudinal Attendance & Grade-Trend Data
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Unsupervised discovery of early-warning at-risk student trajectories across 16 academic weeks.
              Validates discovered trajectory archetypes against historical dropout case records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="accent"
              size="md"
              icon={Sparkles}
              onClick={() => onNavigate('clustering')}
            >
              Analyze Clusters
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={ArrowRight}
              onClick={() => onNavigate('trajectories')}
            >
              View Trajectories
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Student Cohort"
          value={stats?.total_students || 0}
          subtitle={`${stats?.total_academic_records || 0} longitudinal records`}
          icon={Users}
          color="blue"
          badge="16 Weeks"
        />
        <StatCard
          title="Average Attendance"
          value={`${stats?.average_attendance || 0}%`}
          subtitle="Cohort mean attendance rate"
          icon={CalendarCheck}
          color="indigo"
          trend="Tracking Active"
          trendPositive={stats?.average_attendance >= 75}
        />
        <StatCard
          title="Average Academic Score"
          value={`${stats?.average_grade || 0}%`}
          subtitle="Assignments, quizzes & IA"
          icon={Award}
          color="emerald"
          trend="Formative"
        />
        <StatCard
          title="At-Risk Trajectories"
          value={stats?.at_risk_students || 0}
          subtitle={`${atRiskPct}% of cohort flagged`}
          icon={AlertTriangle}
          color="rose"
          badge={`${stats?.historical_dropouts || 0} Dropouts`}
        />
      </div>

      {/* Primary Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrajectoryTrendChart
            data={stats?.weekly_trends || []}
            title="16-Week Cohort Trajectory Longitudinal Progression"
            subtitle="Mean weekly attendance rate, assessment scores, and composite LMS engagement"
          />
        </div>
        <div>
          <RiskDistributionPie
            riskDistribution={stats?.risk_distribution || {}}
            title="Cohort Risk Stratification"
          />
        </div>
      </div>

      {/* Feature Space Scatter Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ClusterScatterChart
            students={students}
            title="Longitudinal Trajectory Space: Attendance Slope vs Grade Slope"
          />
        </div>

        {/* Quick Analytical Summary Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-blue-400" />
              <h4 className="text-sm font-semibold text-white">System Methodology Summary</h4>
            </div>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <span className="font-semibold text-blue-300">Objective 1: Feature Compilation</span>
                <p className="mt-1 text-slate-400">
                  Calculates OLS linear trend slopes, variance, and early-to-late semester drops for attendance & grades.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <span className="font-semibold text-indigo-300">Objective 2: Agglomerative Clustering</span>
                <p className="mt-1 text-slate-400">
                  Compares Ward, Complete, Average, and Single linkage. Evaluated via Silhouette & Davies-Bouldin indices.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <span className="font-semibold text-rose-300">Objective 3: Outcome Validation</span>
                <p className="mt-1 text-slate-400">
                  External validation against historical dropout records without using labels in training.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Developer: Shubham Kumar</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('evaluation')}
            >
              Linkage Benchmark →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
