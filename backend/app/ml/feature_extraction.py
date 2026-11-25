import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from typing import Tuple, List, Dict, Any

class FeatureExtractor:
    """
    Compiles longitudinal trajectory features from weekly student records:
    - Attendance level, trend slope, variability, and late semester drops
    - Academic grade averages, trend slope, and volatility
    - Engagement metrics and decline rates
    """

    FEATURE_COLUMNS = [
        "mean_attendance",
        "attendance_slope",
        "attendance_variability",
        "attendance_late_drop",
        "mean_grade",
        "grade_slope",
        "grade_variability",
        "grade_late_drop",
        "mean_engagement",
        "engagement_slope",
        "lms_login_slope",
        "submission_rate_decline"
    ]

    @staticmethod
    def _calculate_slope(y_series: pd.Series, x_series: pd.Series) -> float:
        """
        Calculates ordinary least squares linear regression slope.
        """
        if len(y_series) < 2:
            return 0.0
        x = x_series.values.astype(float)
        y = y_series.values.astype(float)
        x_mean = np.mean(x)
        y_mean = np.mean(y)
        denom = np.sum((x - x_mean) ** 2)
        if denom == 0:
            return 0.0
        numer = np.sum((x - x_mean) * (y - y_mean))
        return float(numer / denom)

    @classmethod
    def extract_features(cls, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame, StandardScaler]:
        """
        Processes weekly records dataframe into student-level longitudinal trajectory features.
        Returns:
            - features_df: DataFrame with student_id, extracted features, and metadata
            - scaled_features_df: DataFrame with standardized numeric features (mean=0, var=1)
            - scaler: Fitted StandardScaler instance
        """
        students = df["student_id"].unique()
        extracted_rows = []

        # Sort by student and week
        sorted_df = df.sort_values(by=["student_id", "week"]).copy()

        # Compute composite grade if not present
        if "composite_grade" not in sorted_df.columns:
            sorted_df["composite_grade"] = (
                sorted_df["assignment_score"] * 0.40 +
                sorted_df["quiz_score"] * 0.30 +
                sorted_df["internal_assessment_score"] * 0.30
            )

        for s_id, group in sorted_df.groupby("student_id"):
            weeks = group["week"]
            max_week = weeks.max()
            min_week = weeks.min()
            n_obs = len(group)

            # Metadata
            name = group["name"].iloc[0] if "name" in group.columns else s_id
            dept = group["department"].iloc[0] if "department" in group.columns else "General"
            semester = int(group["semester"].iloc[0]) if "semester" in group.columns else 1
            hist_drop = int(group["historical_dropout_status"].iloc[0]) if "historical_dropout_status" in group.columns else 0

            # 1. Attendance features
            att = group["attendance_percentage"]
            mean_att = float(att.mean())
            att_slope = cls._calculate_slope(att, weeks)
            att_std = float(att.std()) if n_obs > 1 else 0.0

            # Early vs late drop
            early_att = att[weeks <= (min_week + 3)].mean() if any(weeks <= (min_week + 3)) else mean_att
            late_att = att[weeks >= (max_week - 3)].mean() if any(weeks >= (max_week - 3)) else mean_att
            att_late_drop = float(early_att - late_att)

            # 2. Grade features
            grades = group["composite_grade"]
            mean_grade = float(grades.mean())
            grade_slope = cls._calculate_slope(grades, weeks)
            grade_std = float(grades.std()) if n_obs > 1 else 0.0

            early_grade = grades[weeks <= (min_week + 3)].mean() if any(weeks <= (min_week + 3)) else mean_grade
            late_grade = grades[weeks >= (max_week - 3)].mean() if any(weeks >= (max_week - 3)) else mean_grade
            grade_late_drop = float(early_grade - late_grade)

            # 3. Engagement features
            eng = group["engagement_score"]
            mean_eng = float(eng.mean())
            eng_slope = cls._calculate_slope(eng, weeks)

            # LMS login slope
            logins = group["lms_logins"] if "lms_logins" in group.columns else pd.Series([10]*n_obs)
            lms_slope = cls._calculate_slope(logins, weeks)

            # Submission decline
            sub = group["assignment_submission_rate"] if "assignment_submission_rate" in group.columns else pd.Series([80]*n_obs)
            early_sub = sub[weeks <= (min_week + 3)].mean() if any(weeks <= (min_week + 3)) else 80.0
            late_sub = sub[weeks >= (max_week - 3)].mean() if any(weeks >= (max_week - 3)) else 80.0
            sub_decline = float(early_sub - late_sub)

            extracted_rows.append({
                "student_id": s_id,
                "name": name,
                "department": dept,
                "semester": semester,
                "mean_attendance": round(mean_att, 2),
                "attendance_slope": round(att_slope, 4),
                "attendance_variability": round(att_std, 2),
                "attendance_late_drop": round(att_late_drop, 2),
                "mean_grade": round(mean_grade, 2),
                "grade_slope": round(grade_slope, 4),
                "grade_variability": round(grade_std, 2),
                "grade_late_drop": round(grade_late_drop, 2),
                "mean_engagement": round(mean_eng, 2),
                "engagement_slope": round(eng_slope, 4),
                "lms_login_slope": round(lms_slope, 4),
                "submission_rate_decline": round(sub_decline, 2),
                # Ground truth outcome kept strictly separate from clustering inputs
                "historical_dropout_status": hist_drop
            })

        features_df = pd.DataFrame(extracted_rows)

        # Standardize numeric features
        scaler = StandardScaler()
        scaled_matrix = scaler.fit_transform(features_df[cls.FEATURE_COLUMNS])
        scaled_features_df = pd.DataFrame(scaled_matrix, columns=cls.FEATURE_COLUMNS, index=features_df.index)

        return features_df, scaled_features_df, scaler
