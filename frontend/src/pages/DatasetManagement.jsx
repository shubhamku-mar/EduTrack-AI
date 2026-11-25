import React, { useState, useEffect } from 'react';
import {
  Upload,
  Database,
  FileCheck,
  AlertTriangle,
  RotateCcw,
  Download,
  Table as TableIcon,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { useToast } from '../components/common/Toast';
import { api } from '../services/api';

export const DatasetManagement = () => {
  const [preview, setPreview] = useState(null);
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const { addToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [previewRes, valRes] = await Promise.all([
        api.getDatasetPreview(15),
        api.validateDataset(),
      ]);
      setPreview(previewRes);
      setValidation(valRes);
    } catch (err) {
      addToast(`Failed to load dataset information: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await api.uploadDataset(file);
      addToast(`Dataset '${file.name}' successfully uploaded and validated!`, 'success');
      await loadData();
    } catch (err) {
      addToast(`Upload failed: ${err.message}`, 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset dataset to the benchmark 300-student x 16-week synthetic cohort?')) {
      return;
    }
    setResetting(true);
    try {
      await api.resetSyntheticDataset();
      addToast('Benchmark longitudinal dataset reinitialized successfully.', 'success');
      await loadData();
    } catch (err) {
      addToast(`Reset failed: ${err.message}`, 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Controls Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            Dataset Management & Ingestion
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Upload institutional longitudinal student datasets (.csv, .xlsx). The system validates required weekly features,
            inspects missing values, and prepares data for hierarchical trajectory clustering.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Download Sample CSV */}
          <a
            href={api.downloadSampleCsvUrl}
            download="longitudinal_student_dataset.csv"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-blue-400" />
            Download Sample CSV
          </a>

          {/* Reset Benchmark Button */}
          <Button
            variant="outline"
            size="sm"
            icon={RotateCcw}
            loading={resetting}
            onClick={handleReset}
          >
            Reset Benchmark
          </Button>

          {/* Upload Button */}
          <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-lg shadow-blue-900/30 transition-all border border-blue-500/30">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Processing...' : 'Upload CSV / Excel'}</span>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Dataset Health & Validation Diagnostics */}
      {validation && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schema Validation Status */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">Schema Verification</h4>
              {validation.is_valid ? (
                <Badge variant="success">Schema Valid</Badge>
              ) : (
                <Badge variant="danger">Schema Error</Badge>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Total Observations:</span>
                <span className="font-mono text-white font-medium">
                  {validation.diagnostics?.total_rows || 0} rows
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Unique Students:</span>
                <span className="font-mono text-white font-medium">
                  {validation.diagnostics?.total_students || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Duplicate Records:</span>
                <span className="font-mono text-white font-medium">
                  {validation.diagnostics?.duplicate_count || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Total Missing Values:</span>
                <span className="font-mono text-white font-medium">
                  {validation.diagnostics?.total_missing_values || 0}
                </span>
              </div>
            </div>

            {validation.missing_columns?.length > 0 && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 space-y-1">
                <span className="font-semibold">Missing Required Columns:</span>
                <p className="font-mono">{validation.missing_columns.join(', ')}</p>
              </div>
            )}
          </div>

          {/* Required Fields Checklist */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h4 className="text-sm font-semibold text-white mb-3">Required Longitudinal Feature Columns</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {[
                'student_id',
                'week',
                'classes_held',
                'classes_attended',
                'attendance_percentage',
                'assignment_score',
                'quiz_score',
                'internal_assessment_score',
                'lms_logins',
                'study_hours',
                'assignment_submission_rate',
                'engagement_score',
              ].map((col) => {
                const isPresent = validation.diagnostics?.columns?.includes(col);
                return (
                  <div
                    key={col}
                    className={`flex items-center gap-2 p-2 rounded-lg border ${
                      isPresent
                        ? 'bg-slate-800/40 border-slate-700/60 text-slate-300'
                        : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {isPresent ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    )}
                    <span className="font-mono text-[11px] truncate">{col}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Dataset Preview Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-blue-400" />
              Active Dataset Preview (First 15 Records)
            </h4>
            <p className="text-xs text-slate-400">
              Weekly longitudinal academic and engagement telemetry
            </p>
          </div>
          <Badge variant="primary">
            {preview?.total_rows || 0} Total Records
          </Badge>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold text-[10px] uppercase">
              <tr>
                {preview?.columns?.map((col) => (
                  <th key={col} className="py-2.5 px-3 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={preview?.columns?.length || 10} className="py-3 px-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  </tr>
                ))
              ) : preview?.rows?.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  {preview.columns.map((col) => (
                    <td key={col} className="py-2 px-3 whitespace-nowrap font-mono text-[11px]">
                      {row[col] !== undefined ? String(row[col]) : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
