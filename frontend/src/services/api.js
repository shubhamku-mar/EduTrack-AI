// API Client for Student Risk Analytics REST Backend

const API_BASE = 'https://edu-track-ai-backend.onrender.com/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      let errorMsg = `HTTP Error ${res.status}: ${res.statusText}`;
      try {
        const errorJson = await res.json();
        if (errorJson.detail) {
          errorMsg = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
        }
      } catch (e) {
        // use default errorMsg
      }
      throw new Error(errorMsg);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Request failed for ${url}:`, err);
    throw err;
  }
}

export const api = {
  // Health
  checkHealth: () => request('/health'),

  // Dashboard
  getDashboardStats: () => request('/dashboard/stats'),

  // Students
  getStudents: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.semester) query.append('semester', params.semester);
    if (params.risk_category) query.append('risk_category', params.risk_category);
    if (params.limit) query.append('limit', params.limit);
    if (params.offset) query.append('offset', params.offset);
    return request(`/students?${query.toString()}`);
  },

  getStudentDetail: (studentId) => request(`/students/${encodeURIComponent(studentId)}`),

  // Datasets
  getDatasetPreview: (limit = 15) => request(`/datasets/preview?limit=${limit}`),
  validateDataset: () => request('/datasets/validate'),
  preprocessDataset: (config) =>
    request('/datasets/preprocess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config || { handle_missing: 'median', remove_duplicates: true, clip_outliers: true }),
    }),
  getExtractedFeatures: (limit = 100) => request(`/datasets/features?limit=${limit}`),
  resetSyntheticDataset: () =>
    request('/datasets/reset-synthetic', {
      method: 'POST',
    }),
  uploadDataset: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/datasets/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.detail || `Upload failed with status ${res.status}`);
    }
    return await res.json();
  },

  // Clustering
  runClustering: (params) =>
    request('/clustering/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params || { n_clusters: 5, linkage_method: 'ward' }),
    }),
  compareLinkages: (n_clusters = 5) => request(`/clustering/compare?n_clusters=${n_clusters}`),
  validateHistoricalOutcomes: () => request('/clustering/validation'),
  getTrajectoryProfiles: () => request('/clustering/profiles'),

  // Reports
  getReportSummary: () => request('/reports/summary'),
  downloadCsvUrl: `${API_BASE}/reports/csv`,
  downloadPdfUrl: `${API_BASE}/reports/pdf`,
  downloadSampleCsvUrl: `${API_BASE}/datasets/sample-csv`,
};
