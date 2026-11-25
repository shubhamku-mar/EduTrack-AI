import React from 'react';
import {
  LayoutDashboard,
  Users,
  Database,
  SlidersHorizontal,
  GitFork,
  TrendingDown,
  Gauge,
  ShieldCheck,
  FileText,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export const Sidebar = ({ activeTab, onSelectTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Student Records', icon: Users },
    { id: 'datasets', label: 'Dataset Management', icon: Database },
    { id: 'preprocessing', label: 'Data Preprocessing', icon: SlidersHorizontal },
    { id: 'clustering', label: 'Hierarchical Clustering', icon: GitFork, badge: 'ML' },
    { id: 'trajectories', label: 'At-Risk Trajectories', icon: TrendingDown },
    { id: 'evaluation', label: 'Model Evaluation', icon: Gauge },
    { id: 'validation', label: 'Historical Validation', icon: ShieldCheck, badge: 'Task 3' },
    { id: 'reports', label: 'Analytics Reports', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/30 ring-1 ring-white/20">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-white">SIH26037</span>
            <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
              INT396
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate max-w-[150px]">Student Risk Analytics</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Analytics & Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-blue-800 text-blue-100'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Institutional Metadata Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="rounded-xl bg-slate-800/60 p-3 border border-slate-700/50">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-300">Shubham Kumar</span>
            <span className="font-mono text-[10px] text-blue-400">RK3P24UKB35</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Lovely Professional University</p>
          <div className="mt-2 pt-2 border-t border-slate-700/40 flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
            <Sparkles className="w-3 h-3" />
            <span>Agglomerative ML Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
