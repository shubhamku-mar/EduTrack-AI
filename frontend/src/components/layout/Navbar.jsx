import React, { useState, useEffect } from 'react';
import {
  Activity,
  Play,
  Download,
  RotateCcw,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../common/Button';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

export const Navbar = ({ activeTab, onRunClustering, onResetDataset }) => {
  const [healthStatus, setHealthStatus] = useState('checking');
  const [isRunning, setIsRunning] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const check = async () => {
      try {
        await api.checkHealth();
        setHealthStatus('online');
      } catch (err) {
        setHealthStatus('offline');
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickRun = async () => {
    setIsRunning(true);
    try {
      await onRunClustering();
      addToast('Agglomerative clustering pipeline executed successfully!', 'success');
    } catch (err) {
      addToast(`Execution failed: ${err.message}`, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const pageTitles = {
    dashboard: 'Longitudinal Trajectory Overview',
    students: 'Student Cohort Directory & Histories',
    datasets: 'Dataset Ingestion & Validation',
    preprocessing: 'Feature Engineering & Standardization',
    clustering: 'Hierarchical Clustering Analysis',
    trajectories: 'Discovered At-Risk Trajectories',
    evaluation: 'Linkage Validity & Metrics Comparison',
    validation: 'Historical Dropout Outcome Validation',
    reports: 'Analytical Report Export Center',
  };

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <span>SIH26037</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="capitalize text-slate-300">{activeTab}</span>
        </div>
        <div className="h-4 w-px bg-slate-700/60 hidden sm:block" />
        <h2 className="text-sm font-semibold text-white tracking-tight hidden sm:block">
          {pageTitles[activeTab] || 'Student Analytics'}
        </h2>
      </div>

      {/* Action Controls & Health */}
      <div className="flex items-center gap-3">
        {/* Live Backend Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700/80 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              healthStatus === 'online'
                ? 'bg-emerald-400 animate-pulse'
                : 'bg-rose-500'
            }`}
          />
          <span className="text-slate-300 text-[11px] font-medium capitalize">
            {healthStatus === 'online' ? 'API Online' : 'Connecting'}
          </span>
        </div>

        {/* Quick Execute Button */}
        <Button
          size="sm"
          variant="primary"
          icon={Play}
          loading={isRunning}
          onClick={handleQuickRun}
          title="Run Hierarchical Clustering with Ward Linkage"
        >
          Run Clustering
        </Button>

        {/* PDF Download Button */}
        <a
          href={api.downloadPdfUrl}
          download="SIH26037_Student_Risk_Report.pdf"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-blue-400" />
          <span>Export PDF</span>
        </a>
      </div>
    </header>
  );
};
