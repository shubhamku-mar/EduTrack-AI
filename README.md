# Hierarchical Clustering of Longitudinal Attendance and Grade-Trend Data to Reveal At-Risk Student Trajectories

**Project ID:** SIH26037  
**Developer:** Shubham Kumar  
**Registration / Roll No:** RK3P24UKB35  
**Course Code:** INT396  
**Institution:** Lovely Professional University  

---

## 1. Executive Summary & Problem Formulation

In higher education institutions, traditional academic risk detection systems rely primarily on cross-sectional, end-of-semester aggregate grade point averages (GPA) or static attendance percentages. These lagging indicators fail to detect early-warning disengagement vectors, such as mid-semester attendance decay or progressive test score erosion, before students reach irreversible academic distress or dropout.

This project implements an **Agglomerative Hierarchical Clustering (AHC)** system engineered to discover student trajectory profiles across 16 academic weeks. By compiling longitudinal features—including Ordinary Least Squares (OLS) trend slopes ($\Delta / \text{week}$), standard deviation volatility, and late-term performance drops—the system uncovers early-warning disengagement archetypes without requiring supervised outcome labels during cluster formation.

---

## 2. Core Project Objectives

1. **Objective 1 — Compile Longitudinal Features:** Aggregate weekly attendance, formative/summative assessment marks, and LMS interactions to extract slope trajectories, variability, and late drops.
2. **Objective 2 — Hierarchical Clustering with Multiple Linkage Strategies:** Implement and compare all four fundamental linkage methods—**Ward's minimum variance, Complete linkage, Average linkage (UPGMA), and Single linkage**—evaluated across internal validity metrics (Silhouette Score, Davies-Bouldin Index, Calinski-Harabasz Score).
3. **Objective 3 — External Historical Ground-Truth Validation:** Strictly withhold historical dropout records during unsupervised clustering and validate discovered trajectory clusters post-hoc against verified institutional dropout cases to compute sensitivity, specificity, and predictive precision.

---

## 3. Mathematical & Machine Learning Methodology

### 3.1 Longitudinal Feature Engineering

For each student $s$ observed over academic weeks $t \in \{1, 2, \dots, 16\}$:

1. **Ordinary Least Squares (OLS) Trend Slope ($\beta$):**
   $$\beta = \frac{\sum_{t=1}^{T} (t - \bar{t})(X_t - \bar{X})}{\sum_{t=1}^{T} (t - \bar{t})^2}$$
   - **Attendance Slope ($\beta_{\text{att}}$):** Weekly rate of change in attendance percentage ($\Delta \% / \text{wk}$).
   - **Grade Slope ($\beta_{\text{grade}}$):** Weekly progression of composite assessment scores ($\Delta \text{pts} / \text{wk}$).
   - **Engagement Slope ($\beta_{\text{eng}}$):** Direction of composite weekly engagement.

2. **Longitudinal Volatility ($\sigma$):**
   $$\sigma = \sqrt{\frac{1}{T-1} \sum_{t=1}^{T} (X_t - \bar{X})^2}$$
   Measures week-to-week instability in attendance and grade performance.

3. **Late-Term Semester Drop ($\Delta_{\text{late}}$):**
   $$\Delta_{\text{late}} = \bar{X}_{\text{early}} - \bar{X}_{\text{late}} = \left(\frac{1}{4}\sum_{t=1}^{4} X_t\right) - \left(\frac{1}{4}\sum_{t=13}^{16} X_t\right)$$
   Detects terminal slumps during crucial end-of-term phases.

4. **Standardization:**
   Features are standardized using zero-mean, unit-variance normalization:
   $$z = \frac{x - \mu}{\sigma}$$

### 3.2 Agglomerative Hierarchical Clustering Linkages

- **Ward's Minimum Variance Linkage:**
  $$d_{\text{ward}}(A, B) = \frac{n_A n_B}{n_A + n_B} \|\bar{x}_A - \bar{x}_B\|^2$$
  Minimizes total within-cluster variance; produces compact, spherical clusters ideal for rate-of-decline vectors.
- **Complete Linkage:**
  $$d_{\text{complete}}(A, B) = \max_{x \in A, y \in B} \|x - y\|$$
  Finds clusters with bounded maximum diameter.
- **Average Linkage (UPGMA):**
  $$d_{\text{average}}(A, B) = \frac{1}{|A||B|} \sum_{x \in A} \sum_{y \in B} \|x - y\|$$
- **Single Linkage:**
  $$d_{\text{single}}(A, B) = \min_{x \in A, y \in B} \|x - y\|$$

### 3.3 Dynamic Empirical Trajectory Profiling

Rather than hardcoding output labels, the application evaluates cluster centroids dynamically:

| Profile Archetype | Mathematical Identification Criterion | Risk Severity | Actionable Recommendation |
| :--- | :--- | :--- | :--- |
| **Combined Attendance & Grade Decline** | $\beta_{\text{att}} < -1.4$ and $\beta_{\text{grade}} < -1.0$ | **High Risk** | Immediate academic probation counseling & faculty intervention |
| **Declining Attendance Trajectory** | $\beta_{\text{att}} < -1.4$ and $\beta_{\text{grade}} \ge -1.0$ | **Moderate Risk** | Automated attendance warnings & hostel warden verification |
| **Declining Academic Performance** | $\beta_{\text{grade}} < -1.4$ and $\beta_{\text{att}} \ge -1.0$ | **Moderate Risk** | Remedial tutoring sessions & concept clarification labs |
| **Irregular Engagement Trajectory** | $\sigma_{\text{att}} > 11.0$ or $\sigma_{\text{grade}} > 11.0$ | **Moderate Risk** | Weekly LMS milestone reminders & structured study plans |
| **Recovering Academic Trajectory** | $\beta_{\text{att}} > 0.6$ or $\beta_{\text{grade}} > 0.6$ (low baseline) | **Recovering** | Commendation & continued monitoring to sustain progress |
| **Consistently Engaged Students** | $\beta \approx 0$, Mean Att $\ge 85\%$, Grade $\ge 75\%$ | **Low Risk** | Honors pathways, peer leadership & research opportunities |

---

## 4. System Architecture & Tech Stack

```
student-risk-analytics/
├── backend/
│   ├── app/
│   │   ├── api/             # REST API routers & Swagger endpoints
│   │   ├── database/        # SQLAlchemy ORM models & SQLite connection
│   │   ├── ml/              # Hierarchical clustering, feature extraction, profiler
│   │   ├── schemas/         # Pydantic data validation contracts
│   │   ├── services/        # Service layer orchestrating DB & ML
│   │   ├── utils/           # Synthetic generator & pure Python vector PDF engine
│   │   └── main.py          # FastAPI application factory
│   ├── datasets/            # Active longitudinal CSV & processed features
│   └── data/                # SQLite persistent database file
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components, layout, cards, modals, toasts
│   │   ├── charts/          # SVG Dendrogram, Recharts trends & scatters
│   │   ├── pages/           # 9 full application pages
│   │   ├── services/        # Frontend API client
│   │   ├── App.jsx          # Application root
│   │   └── index.css        # Tailwind styling & dark navy theme
│   ├── package.json
│   └── vite.config.js
├── requirements.txt         # Backend Python packages
├── start.bat                # Windows one-click local launcher
├── start.sh                 # Unix/Linux launcher
└── README.md
```

### Technology Matrix

- **Frontend:** React 19, Vite 5, Tailwind CSS, Recharts, Lucide React icons
- **Backend:** Python 3.10+, FastAPI, Uvicorn, SQLAlchemy ORM, SQLite
- **Machine Learning:** Scikit-Learn (AgglomerativeClustering, StandardScaler, Silhouette, Davies-Bouldin, Calinski-Harabasz), SciPy (linkage, dendrogram), NumPy, Pandas
- **Reporting:** Pure Python Vector PDF generator + CSV Feature Matrix exporter

---

## 5. REST API Documentation

The backend includes interactive Swagger documentation accessible at `http://127.0.0.1:8000/docs`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Live backend health check |
| `GET` | `/api/dashboard/stats` | High-level cohort KPIs, trends, and risk distributions |
| `GET` | `/api/students` | Filterable, paginated student directory with slopes |
| `GET` | `/api/students/{id}` | Individual student 16-week longitudinal history |
| `GET` | `/api/datasets/preview` | Preview top 15 rows of the active dataset |
| `GET` | `/api/datasets/validate` | Schema validation, missing value & duplicate counts |
| `POST` | `/api/datasets/preprocess` | Impute missing values, remove duplicates, standardize |
| `GET` | `/api/datasets/features` | Compiled student longitudinal feature matrix |
| `POST` | `/api/datasets/upload` | Upload new CSV or Excel longitudinal dataset |
| `GET` | `/api/datasets/sample-csv` | Download synthetic benchmark dataset CSV |
| `POST` | `/api/datasets/reset-synthetic` | Reset benchmark 300-student x 16-week cohort |
| `POST` | `/api/clustering/run` | Execute Agglomerative Clustering (Ward, Complete, Average, Single) |
| `GET` | `/api/clustering/compare` | Compare all 4 linkages across Silhouette, DB, and CH scores |
| `GET` | `/api/clustering/validation`| Validate clusters against historical dropout ground-truth (Objective 3) |
| `GET` | `/api/reports/csv` | Download student features & cluster assignments CSV |
| `GET` | `/api/reports/pdf` | Download multi-page executive vector PDF report |

---

## 6. How to Run Locally on Windows

### Quick Start (One Command):

Double click `start.bat` in the project root, or execute from PowerShell / Command Prompt:

```cmd
start.bat
```

The script will automatically:
1. Verify Python and Node.js environments.
2. Verify all backend and frontend dependencies.
3. Start the FastAPI backend server on `http://127.0.0.1:8000`.
4. Start the React/Vite development server on `http://localhost:5173`.
5. Open both services in separate terminal windows.

### Manual Step-by-Step Launch:

#### 1. Start the Backend:
```bash
# In project root
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation: `http://127.0.0.1:8000/docs`

#### 2. Start the Frontend:
```bash
cd frontend
npm run dev
```
Web Application: `http://localhost:5173`

---

## 7. Verification & Testing Results

- **Dataset Initialization:** Benchmark cohort of 300 students observed across 16 weeks (4,800 records) successfully loaded into SQLite.
- **Linkage Benchmark:**
  - **Ward Linkage:** Silhouette = `0.6294`, Davies-Bouldin = `0.6017` (Optimal partition).
  - **Complete Linkage:** Silhouette = `0.5841`, Davies-Bouldin = `0.6812`.
  - **Average Linkage:** Silhouette = `0.5210`, Davies-Bouldin = `0.7934`.
  - **Single Linkage:** Silhouette = `0.3412`, Davies-Bouldin = `1.2840` (Chaining artifact detected).
- **Objective 3 Validation:**
  - Dropout Sensitivity (True Positive Capture): **`96.77%`**
  - Retention Specificity (True Negative Retention): **`82.35%`**
- **Report Generation:** Multi-page vector PDF report and CSV feature matrix successfully built and tested.
