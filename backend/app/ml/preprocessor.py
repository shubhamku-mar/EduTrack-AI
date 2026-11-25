import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple, List

REQUIRED_COLUMNS = [
    "student_id",
    "week",
    "classes_held",
    "classes_attended",
    "attendance_percentage",
    "assignment_score",
    "quiz_score",
    "internal_assessment_score",
    "lms_logins",
    "study_hours",
    "assignment_submission_rate",
    "engagement_score"
]

OPTIONAL_COLUMNS = [
    "semester",
    "name",
    "department",
    "historical_dropout_status"
]

class DataPreprocessor:
    """
    Handles data validation, missing value imputation, duplicate removal,
    outlier detection, and dataset statistics for longitudinal student records.
    """

    @staticmethod
    def validate_columns(df: pd.DataFrame) -> Tuple[bool, List[str], List[str]]:
        """
        Checks for missing required columns and identifies extra columns.
        """
        missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
        extra = [col for col in df.columns if col not in REQUIRED_COLUMNS and col not in OPTIONAL_COLUMNS]
        is_valid = len(missing) == 0
        return is_valid, missing, extra

    @staticmethod
    def inspect_dataset(df: pd.DataFrame) -> Dict[str, Any]:
        """
        Computes comprehensive summary statistics and quality diagnostics.
        """
        total_rows = len(df)
        total_students = df["student_id"].nunique() if "student_id" in df.columns else 0
        duplicate_count = int(df.duplicated(subset=["student_id", "week"] if "week" in df.columns else None).sum())
        missing_counts = df.isnull().sum().to_dict()
        total_missing = int(df.isnull().sum().sum())

        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        stats = {}
        for col in numeric_cols:
            stats[col] = {
                "mean": round(float(df[col].mean()), 2) if not df[col].empty else 0,
                "std": round(float(df[col].std()), 2) if not df[col].empty else 0,
                "min": round(float(df[col].min()), 2) if not df[col].empty else 0,
                "max": round(float(df[col].max()), 2) if not df[col].empty else 0,
                "missing": int(missing_counts.get(col, 0))
            }

        return {
            "total_rows": total_rows,
            "total_students": total_students,
            "duplicate_count": duplicate_count,
            "total_missing_values": total_missing,
            "missing_per_column": missing_counts,
            "numeric_stats": stats,
            "columns": list(df.columns)
        }

    @staticmethod
    def clean_dataset(
        df: pd.DataFrame,
        handle_missing: str = "median",
        remove_duplicates: bool = True,
        clip_outliers: bool = True
    ) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Cleans dataset by deduplicating, imputing missing values, and clipping outliers.
        """
        cleaned = df.copy()
        report = {
            "initial_rows": len(cleaned),
            "duplicates_removed": 0,
            "missing_imputed": 0,
            "outliers_clipped": 0
        }

        # 1. Deduplication
        if remove_duplicates:
            subset = ["student_id", "week"] if "student_id" in cleaned.columns and "week" in cleaned.columns else None
            initial_len = len(cleaned)
            cleaned = cleaned.drop_duplicates(subset=subset)
            report["duplicates_removed"] = initial_len - len(cleaned)

        # 2. Handle Missing Values
        numeric_cols = cleaned.select_dtypes(include=[np.number]).columns
        report["missing_imputed"] = int(cleaned[numeric_cols].isnull().sum().sum())

        if handle_missing == "median":
            for col in numeric_cols:
                cleaned[col] = cleaned[col].fillna(cleaned[col].median())
        elif handle_missing == "mean":
            for col in numeric_cols:
                cleaned[col] = cleaned[col].fillna(cleaned[col].mean())
        elif handle_missing == "drop":
            cleaned = cleaned.dropna(subset=numeric_cols)

        # Categorical fill
        cat_cols = cleaned.select_dtypes(exclude=[np.number]).columns
        for col in cat_cols:
            cleaned[col] = cleaned[col].fillna("Unknown")

        # 3. Clip bounded domain values
        if "attendance_percentage" in cleaned.columns:
            cleaned["attendance_percentage"] = cleaned["attendance_percentage"].clip(0.0, 100.0)
        if "assignment_score" in cleaned.columns:
            cleaned["assignment_score"] = cleaned["assignment_score"].clip(0.0, 100.0)
        if "quiz_score" in cleaned.columns:
            cleaned["quiz_score"] = cleaned["quiz_score"].clip(0.0, 100.0)
        if "internal_assessment_score" in cleaned.columns:
            cleaned["internal_assessment_score"] = cleaned["internal_assessment_score"].clip(0.0, 100.0)
        if "assignment_submission_rate" in cleaned.columns:
            cleaned["assignment_submission_rate"] = cleaned["assignment_submission_rate"].clip(0.0, 100.0)
        if "engagement_score" in cleaned.columns:
            cleaned["engagement_score"] = cleaned["engagement_score"].clip(0.0, 100.0)

        # 4. Outlier Clipping via IQR for continuous fields
        if clip_outliers:
            for col in ["lms_logins", "study_hours"]:
                if col in cleaned.columns:
                    q1 = cleaned[col].quantile(0.01)
                    q99 = cleaned[col].quantile(0.99)
                    outliers = ((cleaned[col] < q1) | (cleaned[col] > q99)).sum()
                    report["outliers_clipped"] += int(outliers)
                    cleaned[col] = cleaned[col].clip(q1, q99)

        report["final_rows"] = len(cleaned)
        return cleaned, report
