import os
import io
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from ..database.models import Student, LongitudinalRecord
from ..ml.preprocessor import DataPreprocessor
from ..ml.feature_extraction import FeatureExtractor
from ..utils.synthetic_data import generate_synthetic_longitudinal_dataset

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATASETS_DIR = os.path.join(BASE_DIR, "datasets")
os.makedirs(DATASETS_DIR, exist_ok=True)

DEFAULT_DATASET_PATH = os.path.join(DATASETS_DIR, "synthetic_longitudinal_student_data.csv")
PROCESSED_FEATURES_PATH = os.path.join(DATASETS_DIR, "processed_features.csv")

class DatasetService:
    DEFAULT_DATASET_PATH = DEFAULT_DATASET_PATH
    PROCESSED_FEATURES_PATH = PROCESSED_FEATURES_PATH

    """
    Manages loading, validating, storing, preprocessing, and querying
    longitudinal student datasets.
    """

    @classmethod
    def get_or_create_default_dataset(cls, db: Session = None) -> pd.DataFrame:
        """
        Retrieves existing dataset CSV or generates the 300-student longitudinal dataset.
        """
        if not os.path.exists(DEFAULT_DATASET_PATH):
            df = generate_synthetic_longitudinal_dataset(num_students=300, num_weeks=16, seed=42)
            df.to_csv(DEFAULT_DATASET_PATH, index=False)
            if db is not None:
                cls.populate_db_from_dataframe(df, db)
            return df
        else:
            df = pd.read_csv(DEFAULT_DATASET_PATH)
            # Ensure DB is populated if empty
            if db is not None:
                student_count = db.query(Student).count()
                if student_count == 0:
                    cls.populate_db_from_dataframe(df, db)
            return df

    @classmethod
    def populate_db_from_dataframe(cls, df: pd.DataFrame, db: Session):
        """
        Clears and bulk-loads Student and LongitudinalRecord rows into SQLite.
        """
        db.query(LongitudinalRecord).delete()
        db.query(Student).delete()
        db.commit()

        # Group by student
        student_records = []
        long_records = []

        students_grouped = df.groupby("student_id")
        for s_id, group in students_grouped:
            first_row = group.iloc[0]
            student = Student(
                student_id=s_id,
                name=str(first_row.get("name", s_id)),
                semester=int(first_row.get("semester", 1)),
                department=str(first_row.get("department", "Computer Science")),
                historical_dropout_status=int(first_row.get("historical_dropout_status", 0))
            )
            student_records.append(student)

        db.bulk_save_objects(student_records)
        db.commit()

        # Insert weekly longitudinal records
        for _, row in df.iterrows():
            rec = LongitudinalRecord(
                student_id=str(row["student_id"]),
                week=int(row["week"]),
                classes_held=int(row["classes_held"]),
                classes_attended=int(row["classes_attended"]),
                attendance_percentage=float(row["attendance_percentage"]),
                assignment_score=float(row["assignment_score"]),
                quiz_score=float(row["quiz_score"]),
                internal_assessment_score=float(row["internal_assessment_score"]),
                lms_logins=int(row["lms_logins"]),
                study_hours=float(row["study_hours"]),
                assignment_submission_rate=float(row["assignment_submission_rate"]),
                engagement_score=float(row["engagement_score"])
            )
            long_records.append(rec)

        db.bulk_save_objects(long_records)
        db.commit()

    @classmethod
    def load_active_dataset(cls) -> pd.DataFrame:
        if os.path.exists(DEFAULT_DATASET_PATH):
            return pd.read_csv(DEFAULT_DATASET_PATH)
        return cls.get_or_create_default_dataset()

    @classmethod
    def process_and_cache_features(cls, df: pd.DataFrame) -> pd.DataFrame:
        features_df, scaled_df, _ = FeatureExtractor.extract_features(df)
        features_df.to_csv(PROCESSED_FEATURES_PATH, index=False)
        return features_df

    @classmethod
    def get_processed_features(cls) -> pd.DataFrame:
        if os.path.exists(PROCESSED_FEATURES_PATH):
            return pd.read_csv(PROCESSED_FEATURES_PATH)
        df = cls.load_active_dataset()
        return cls.process_and_cache_features(df)

    @classmethod
    def upload_dataset(cls, file_bytes: bytes, filename: str, db: Session) -> dict:
        """
        Parses CSV or Excel bytes, validates schema, updates database and datasets.
        """
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(file_bytes))
        elif filename.endswith((".xls", ".xlsx")):
            df = pd.read_excel(io.BytesIO(file_bytes))
        else:
            raise ValueError("Unsupported format. Please upload a .csv or .xlsx file.")

        is_valid, missing, extra = DataPreprocessor.validate_columns(df)
        if not is_valid:
            return {
                "success": False,
                "error": f"Missing required columns: {', '.join(missing)}",
                "missing_columns": missing
            }

        # Clean and save
        cleaned_df, report = DataPreprocessor.clean_dataset(df)
        cleaned_df.to_csv(DEFAULT_DATASET_PATH, index=False)

        # Repopulate DB
        cls.populate_db_from_dataframe(cleaned_df, db)

        # Reprocess features
        features_df = cls.process_and_cache_features(cleaned_df)

        stats = DataPreprocessor.inspect_dataset(cleaned_df)

        return {
            "success": True,
            "filename": filename,
            "cleaning_report": report,
            "stats": stats,
            "total_students": len(features_df)
        }
