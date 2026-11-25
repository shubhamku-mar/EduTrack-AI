import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { api } from '../services/api';

export const Reports = () => {
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await api.getReportSummary();
        setMetadata(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMeta();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Overview Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Analytical Reports & Export Center (Section I)
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Generate and download comprehensive analytical documentation. Export student-level trajectory data
            in CSV format, or download the multi-page institutional vector PDF analysis report.
          </p>
        </div>
      </div>

      {/* Download Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Report Card */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-blue-500/30 shadow-xl flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white">
                  Executive Analytical PDF Report
                </h4>
                <Badge variant="primary">Multi-Page PDF</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Comprehensive vector report formatted with executive problem statement, dataset feature
                engineering statistics, linkage validity comparison table, cluster profiles, and historical dropout validation.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Executive Summary & Institutional Context</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ward vs Complete vs Average vs Single Linkage Comparison</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>At-Risk Trajectory Profiles & Actionable Interventions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>External Ground-Truth Dropout Validation (Task 3)</span>
              </div>
            </div>
          </div>

          <a
            href={api.downloadPdfUrl}
            download="SIH26037_Student_Risk_Report.pdf"
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-blue-900/30 border border-blue-500/30"
          >
            <Download className="w-4 h-4" />
            <span>Download Official PDF Report</span>
          </a>
        </div>

        {/* CSV Data Export Card */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-xl flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white">
                  Student Trajectory Features & Clusters (CSV)
                </h4>
                <Badge variant="success">Raw Data</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Tabular CSV export containing all student IDs, names, departments, longitudinal slopes,
                variability measures, late-term drops, assigned cluster IDs, and validation labels.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mean Attendance, Grade & Engagement Scores</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ordinary Least Squares Linear Slopes (Δ/wk)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Agglomerative Cluster IDs & Profile Archetypes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ground-Truth Historical Dropout Labels</span>
              </div>
            </div>
          </div>

          <a
            href={api.downloadCsvUrl}
            download="student_risk_trajectories_report.csv"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download CSV Feature Matrix</span>
          </a>
        </div>
      </div>

      {/* Institutional Metadata Card */}
      <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-blue-400" />
          Academic Submission Details
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <span className="text-slate-400">Project ID</span>
            <p className="font-mono font-bold text-white mt-0.5">SIH26037</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <span className="text-slate-400">Developer</span>
            <p className="font-bold text-white mt-0.5">Shubham Kumar</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <span className="text-slate-400">Registration / Roll</span>
            <p className="font-mono font-bold text-white mt-0.5">RK3P24UKB35</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <span className="text-slate-400">Institution</span>
            <p className="font-bold text-white mt-0.5">Lovely Professional University</p>
          </div>
        </div>
      </div>
    </div>
  );
};
