import pandas as pd
import numpy as np
from typing import Dict, Any, List

class TrajectoryProfiler:
    """
    Dynamically maps unsupervised clusters to interpretable student trajectory profiles
    based purely on empirical cluster statistics (slopes, means, variabilities).
    """

    @classmethod
    def profile_clusters(
        cls,
        features_df: pd.DataFrame,
        cluster_labels: List[int]
    ) -> Dict[int, Dict[str, Any]]:
        """
        Analyzes the distribution of features within each cluster to assign
        dynamic statistical labels and risk categories.
        """
        df = features_df.copy()
        df["cluster"] = cluster_labels

        cluster_profiles = {}
        unique_clusters = sorted(df["cluster"].unique())

        for c_id in unique_clusters:
            c_data = df[df["cluster"] == c_id]
            size = len(c_data)
            pct = round((size / len(df)) * 100, 1)

            mean_att = float(c_data["mean_attendance"].mean())
            att_slope = float(c_data["attendance_slope"].mean())
            att_var = float(c_data["attendance_variability"].mean())
            att_late_drop = float(c_data["attendance_late_drop"].mean())

            mean_grade = float(c_data["mean_grade"].mean())
            grade_slope = float(c_data["grade_slope"].mean())
            grade_var = float(c_data["grade_variability"].mean())
            grade_late_drop = float(c_data["grade_late_drop"].mean())

            mean_eng = float(c_data["mean_engagement"].mean())
            eng_slope = float(c_data["engagement_slope"].mean())
            sub_decline = float(c_data["submission_rate_decline"].mean())

            # Dynamic classification based on empirical cluster centers
            if att_slope < -1.4 and grade_slope < -1.0:
                label = "Combined Attendance and Grade Decline"
                risk = "High Risk"
                color = "#EF4444" # red
                description = "Critical dual deterioration across both class presence and assessment scores. Urgent academic intervention required."
                recommendation = "Immediate faculty counselor outreach, academic probation support, and parent-mentor conference."
            elif att_slope < -1.4 and grade_slope >= -1.0:
                label = "Declining Attendance Trajectory"
                risk = "Moderate Risk"
                color = "#F97316" # orange
                description = "Consistent absenteeism trend despite baseline competence in academic tasks. Early warning sign of potential disengagement."
                recommendation = "Automated attendance warning alerts, hostel warden check-in, and peer buddy assignment."
            elif grade_slope < -1.4 and att_slope >= -1.0:
                label = "Declining Academic Performance"
                risk = "Moderate Risk"
                color = "#FBBF24" # amber
                description = "Student attends classes reliably but experiences worsening test scores and assignment grades over the semester."
                recommendation = "Remedial tutoring sessions, concept clarification workshops, and doubt-clearing labs."
            elif att_var > 11.0 or grade_var > 11.0:
                label = "Irregular Engagement Trajectory"
                risk = "Moderate Risk"
                color = "#8B5CF6" # purple
                description = "Erratic patterns with high week-to-week volatility in attendance and sporadic submission habits."
                recommendation = "Structured weekly milestones, LMS reminder prompts, and consistent progress tracking."
            elif att_slope > 0.6 or grade_slope > 0.6:
                label = "Recovering Academic Trajectory"
                risk = "Recovering"
                color = "#3B82F6" # blue
                description = "Early academic or attendance deficit followed by sustained upward recovery across the second half of the term."
                recommendation = "Positive reinforcement feedback, continued monitoring to prevent relapse, and commendation."
            else:
                label = "Consistently Engaged Students"
                risk = "Low Risk"
                color = "#10B981" # emerald green
                description = "Consistently high attendance, stable academic scores, and dependable LMS interaction."
                recommendation = "Advanced research projects, peer tutoring leadership, and honors/scholarship pathways."

            cluster_profiles[int(c_id)] = {
                "cluster_id": int(c_id),
                "profile_label": label,
                "risk_category": risk,
                "color": color,
                "description": description,
                "recommendation": recommendation,
                "student_count": size,
                "percentage_of_cohort": pct,
                "metrics": {
                    "mean_attendance": round(mean_att, 2),
                    "attendance_slope": round(att_slope, 4),
                    "attendance_variability": round(att_var, 2),
                    "attendance_late_drop": round(att_late_drop, 2),
                    "mean_grade": round(mean_grade, 2),
                    "grade_slope": round(grade_slope, 4),
                    "grade_variability": round(grade_var, 2),
                    "grade_late_drop": round(grade_late_drop, 2),
                    "mean_engagement": round(mean_eng, 2),
                    "engagement_slope": round(eng_slope, 4),
                    "submission_rate_decline": round(sub_decline, 2)
                }
            }

        return cluster_profiles
