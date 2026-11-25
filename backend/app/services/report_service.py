import os
import datetime
import pandas as pd
from sqlalchemy.orm import Session
from .dataset_service import DatasetService
from .ml_service import MLService
from ..utils.pdf_generator import SimplePDFBuilder
from ..ml.evaluation import ModelEvaluator
from ..ml.feature_extraction import FeatureExtractor

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REPORTS_DIR = os.path.join(BASE_DIR, "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)

class ReportService:
    """
    Generates downloadable analytical reports in CSV and PDF formats.
    """

    @classmethod
    def generate_csv_report(cls) -> str:
        """
        Exports full student-level longitudinal features and trajectory assignments.
        """
        df = DatasetService.get_processed_features()
        return df.to_csv(index=False)

    @classmethod
    def generate_pdf_report(cls, db: Session = None) -> bytes:
        """
        Compiles a comprehensive PDF analytics report with multi-section summaries,
        linkage evaluation tables, cluster trajectory metrics, and historical validation.
        """
        # Ensure clustering and validation results are fresh
        val_res = MLService.validate_historical_outcomes(db=db)
        comp_res = MLService.compare_linkages(n_clusters=5)
        df_features = DatasetService.get_processed_features()

        pdf = SimplePDFBuilder(title="Student At-Risk Trajectory Analytics Report")

        # ---- PAGE 1 ----
        pdf.add_header(
            "Student Longitudinal Trajectory Analytics Report",
            "Project ID: SIH26037 | Dev: Shubham Kumar (RK3P24UKB35) | LPU"
        )

        pdf.add_section_title("1. Project Overview & Institutional Problem Statement")
        pdf.add_paragraph(
            "This project implements Agglomerative Hierarchical Clustering on longitudinal attendance, "
            "formative/summative assessment trends, and LMS engagement signals across 16 academic weeks. "
            "By capturing rates of change (slopes) and volatility rather than static semester averages, "
            "the system detects early-warning disengagement vectors before academic failure or dropout occurs."
        )

        pdf.add_section_title("2. Longitudinal Dataset & Feature Engineering Summary")
        pdf.add_key_value("Total Students in Cohort", str(val_res["total_students"]))
        pdf.add_key_value("Longitudinal Observation Window", "16 Academic Weeks")
        pdf.add_key_value("Standardization Strategy", "StandardScaler (Zero-Mean, Unit-Variance)")
        pdf.add_key_value("Primary Trajectory Features", "Attendance Slope, Grade Slope, Volatility, Early-Late Drop")
        pdf.add_key_value("Baseline Historical Dropout Count", f"{val_res['overall_dropout_count']} students ({val_res['overall_dropout_rate']}%)")
        pdf.y -= 10

        pdf.add_section_title("3. Linkage Method Evaluation (Objective 2)")
        pdf.add_paragraph(
            "Internal cluster validity indices were calculated across all four agglomerative hierarchical linkage "
            f"strategies for k=5 clusters. Optimal clustering was achieved using '{comp_res['best_method'].capitalize()}' linkage."
        )

        link_headers = ["Linkage Method", "Silhouette", "Davies-Bouldin", "Calinski-Harabasz", "Assessment"]
        link_rows = []
        for l_res in comp_res["linkage_comparisons"]:
            sil = str(l_res.get("silhouette_score", 0.0))
            db_score = str(l_res.get("davies_bouldin_index", 0.0))
            ch = str(l_res.get("calinski_harabasz_index", 0.0))
            method = l_res.get("linkage_method", "").capitalize()
            status = "Optimal" if method.lower() == comp_res["best_method"].lower() else "Sub-optimal"
            link_rows.append([method, sil, db_score, ch, status])

        pdf.add_table(link_headers, link_rows, col_widths=[110, 80, 100, 120, 102])

        # ---- PAGE 2 ----
        pdf.new_page()
        pdf.add_header(
            "Discovered Trajectories & Ground-Truth Validation",
            "SIH26037 - Agglomerative Hierarchical Clustering"
        )

        pdf.add_section_title("4. Discovered Student Trajectory Profiles")
        pdf.add_paragraph(
            "Agglomerative hierarchical clustering segmented the cohort into statistically distinct trajectory archetypes "
            "characterized by dynamic trend slopes and variance:"
        )

        cluster_headers = ["Cluster", "Trajectory Profile", "Risk Level", "Students", "Dropout %"]
        cluster_rows = []
        for c in val_res["clusters"]:
            cluster_rows.append([
                f"C{c['cluster_id']}",
                c["profile_label"][:28],
                c["risk_category"],
                f"{c['total_students']} ({round((c['total_students']/val_res['total_students'])*100,1)}%)",
                f"{c['dropout_percentage']}%"
            ])

        pdf.add_table(cluster_headers, cluster_rows, col_widths=[50, 200, 90, 85, 87])

        pdf.add_section_title("5. Historical Outcome Validation (Objective 3)")
        pdf.add_paragraph(
            "Crucially, historical dropout labels were withheld during unsupervised clustering. Discovered trajectories "
            "were validated post-hoc against verified institutional dropout case records:"
        )
        pdf.add_key_value("High-Risk Trajectory Sensitivity", f"{val_res['metrics']['sensitivity']}% (True Positive Capture)")
        pdf.add_key_value("High-Risk Predictive Precision", f"{val_res['metrics']['precision']}%")
        pdf.add_key_value("Low-Risk Retention Specificity", f"{val_res['metrics']['specificity']}% (True Negative Retention)")
        pdf.y -= 10

        pdf.add_section_title("6. Actionable Institutional Interventions")
        pdf.add_paragraph(
            "1. Rapid Alert Protocols: Trigger academic counseling for students exhibiting attendance slope < -1.5/wk by Week 5."
        )
        pdf.add_paragraph(
            "2. Targeted Remediation: Students with grade decline but stable attendance require concept coaching, not attendance discipline."
        )
        pdf.add_paragraph(
            "3. Longitudinal Monitoring: Continuous reassessment at mid-term (Week 8) to capture recovering student trajectories."
        )

        pdf.y -= 15
        pdf.add_paragraph(
            f"Report Generated: {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')} | System: Antigravity AI Engine",
            max_chars=90
        )

        return pdf.build_pdf_bytes()
