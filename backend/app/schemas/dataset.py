from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DatasetValidationResult(BaseModel):
    is_valid: bool
    total_rows: int
    total_students: int
    missing_columns: List[str]
    extra_columns: List[str]
    total_missing_values: int
    duplicate_count: int
    missing_per_column: Dict[str, int]
    numeric_stats: Dict[str, Dict[str, float]]
    columns: List[str]

class PreprocessingRequest(BaseModel):
    handle_missing: str = "median" # 'median', 'mean', 'drop'
    remove_duplicates: bool = True
    clip_outliers: bool = True

class PreprocessingResponse(BaseModel):
    status: str
    report: Dict[str, Any]
    feature_count: int
    total_students_processed: int
    feature_columns: List[str]
