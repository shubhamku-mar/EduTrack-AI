from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ...database.connection import get_db
from ...services.student_service import StudentService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_statistics(db: Session = Depends(get_db)):
    """
    Returns high-level statistics for the student risk analytics dashboard:
    total students, records, attendance average, grade average, at-risk counts,
    dropout counts, risk distribution, and 16-week longitudinal trends.
    """
    return StudentService.get_dashboard_stats(db)
