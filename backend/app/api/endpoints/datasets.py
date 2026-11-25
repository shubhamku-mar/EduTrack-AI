from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session
import io
import pandas as pd
from ...database.connection import get_db
from ...services.dataset_service import DatasetService
from ...ml.preprocessor import DataPreprocessor
from ...schemas.dataset import PreprocessingRequest
from ...utils.synthetic_data import generate_synthetic_longitudinal_dataset

router = APIRouter(prefix="/datasets", tags=["Datasets"])

@router.get("/preview")
def preview_dataset(limit: int = 15):
    """
    Returns the first N rows of the active dataset for tabular preview.
    """
    df = DatasetService.load_active_dataset()
    preview_df = df.head(limit).fillna("")
    return {
        "columns": list(df.columns),
        "total_rows": len(df),
        "total_students": int(df["student_id"].nunique()) if "student_id" in df.columns else 0,
        "rows": preview_df.to_dict(orient="records")
    }

@router.get("/validate")
def validate_dataset():
    """
    Performs data quality validation, checking required columns, nulls, and outliers.
    """
    df = DatasetService.load_active_dataset()
    is_valid, missing, extra = DataPreprocessor.validate_columns(df)
    stats = DataPreprocessor.inspect_dataset(df)

    return {
        "is_valid": is_valid,
        "missing_columns": missing,
        "extra_columns": extra,
        "diagnostics": stats
    }

@router.post("/preprocess")
def preprocess_dataset(req: PreprocessingRequest, db: Session = Depends(get_db)):
    """
    Preprocesses the dataset: handles missing values, removes duplicates, and standardizes.
    """
    df = DatasetService.load_active_dataset()
    cleaned_df, report = DataPreprocessor.clean_dataset(
        df=df,
        handle_missing=req.handle_missing,
        remove_duplicates=req.remove_duplicates,
        clip_outliers=req.clip_outliers
    )

    # Save cleaned
    cleaned_df.to_csv(DatasetService.DEFAULT_DATASET_PATH, index=False)
    DatasetService.populate_db_from_dataframe(cleaned_df, db)
    features_df = DatasetService.process_and_cache_features(cleaned_df)

    return {
        "status": "success",
        "cleaning_report": report,
        "total_students_processed": len(features_df),
        "feature_count": len(features_df.columns),
        "feature_columns": list(features_df.columns)
    }

@router.get("/features")
def get_extracted_features(limit: int = 50):
    """
    Returns compiled student longitudinal trajectory features.
    """
    df = DatasetService.get_processed_features()
    return {
        "total_students": len(df),
        "features": df.head(limit).fillna("").to_dict(orient="records")
    }

@router.post("/upload")
async def upload_dataset_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Uploads a new CSV or Excel longitudinal dataset, validates, cleans, and stores it.
    """
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        result = DatasetService.upload_dataset(
            file_bytes=contents,
            filename=file.filename,
            db=db
        )
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Validation failed."))
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process dataset: {str(e)}")

@router.get("/sample-csv")
def download_sample_csv():
    """
    Downloads the verified synthetic longitudinal dataset as a CSV.
    """
    df = DatasetService.load_active_dataset()
    csv_bytes = df.to_csv(index=False).encode("utf-8")
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=longitudinal_student_dataset.csv"}
    )

@router.post("/reset-synthetic")
def reset_synthetic_dataset(db: Session = Depends(get_db)):
    """
    Regenerates the benchmark 300-student x 16-week longitudinal dataset and resets DB.
    """
    df = generate_synthetic_longitudinal_dataset(num_students=300, num_weeks=16, seed=42)
    df.to_csv(DatasetService.DEFAULT_DATASET_PATH, index=False)
    DatasetService.populate_db_from_dataframe(df, db)
    features_df = DatasetService.process_and_cache_features(df)
    return {
        "status": "success",
        "message": "Benchmark longitudinal dataset successfully generated and initialized.",
        "total_students": len(features_df),
        "total_records": len(df)
    }
