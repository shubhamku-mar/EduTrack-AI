from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class WeeklyRecordSchema(BaseModel):
    week: int
    classes_held: int
    classes_attended: int
    attendance_percentage: float
    assignment_score: float
    quiz_score: float
    internal_assessment_score: float
    lms_logins: int
    study_hours: float
    assignment_submission_rate: float
    engagement_score: float

class StudentListSchema(BaseModel):
    student_id: str
    name: str
    semester: int
    department: str
    historical_dropout_status: int
    mean_attendance: Optional[float] = None
    mean_grade: Optional[float] = None
    attendance_slope: Optional[float] = None
    grade_slope: Optional[float] = None
    cluster_id: Optional[int] = None
    profile_label: Optional[str] = None
    risk_category: Optional[str] = None

class StudentDetailSchema(BaseModel):
    student_id: str
    name: str
    semester: int
    department: str
    historical_dropout_status: int
    records: List[WeeklyRecordSchema]
    trajectory_summary: Optional[Dict[str, Any]] = None
