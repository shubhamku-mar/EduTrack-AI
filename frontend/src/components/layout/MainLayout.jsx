import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const MainLayout = ({
  children,
  activeTab,
  onSelectTab,
  onRunClustering,
  onResetDataset,
}) => {
  return (
    <div className="min-h-screen bg-[#0b1329] text-slate-100 flex flex-row">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onSelectTab={onSelectTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          activeTab={activeTab}
          onRunClustering={onRunClustering}
          onResetDataset={onResetDataset}
        />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
};
