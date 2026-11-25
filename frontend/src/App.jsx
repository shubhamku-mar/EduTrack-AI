import React, { useState } from 'react';
import { ToastProvider } from './components/common/Toast';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { StudentRecords } from './pages/StudentRecords';
import { DatasetManagement } from './pages/DatasetManagement';
import { DataPreprocessing } from './pages/DataPreprocessing';
import { HierarchicalClustering } from './pages/HierarchicalClustering';
import { TrajectoryAnalysis } from './pages/TrajectoryAnalysis';
import { ModelEvaluation } from './pages/ModelEvaluation';
import { OutcomeValidation } from './pages/OutcomeValidation';
import { Reports } from './pages/Reports';
import { api } from './services/api';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleRunClustering = async () => {
    await api.runClustering({ n_clusters: 5, linkage_method: 'ward' });
    setActiveTab('clustering');
  };

  const handleResetDataset = async () => {
    await api.resetSyntheticDataset();
    setActiveTab('datasets');
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'students':
        return <StudentRecords />;
      case 'datasets':
        return <DatasetManagement />;
      case 'preprocessing':
        return <DataPreprocessing onNavigate={setActiveTab} />;
      case 'clustering':
        return <HierarchicalClustering onNavigate={setActiveTab} />;
      case 'trajectories':
        return <TrajectoryAnalysis onNavigate={setActiveTab} />;
      case 'evaluation':
        return <ModelEvaluation />;
      case 'validation':
        return <OutcomeValidation />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <MainLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onRunClustering={handleRunClustering}
      onResetDataset={handleResetDataset}
    >
      {renderActivePage()}
    </MainLayout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
