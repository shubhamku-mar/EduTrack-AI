from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from ...database.connection import get_db
from ...services.student_service import StudentService

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("")
def list_students(
    search: Optional[str] = Query(None, description="Search by ID, name, or department"),
    semester: Optional[int] = Query(None, description="Filter by semester"),
    risk_category: Optional[str] = Query(None, description="Filter by risk category: Low Risk, Moderate Risk, High Risk, Recovering"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Retrieves filtered and paginated list of students with trajectory metrics and risk category.
    """
    return StudentService.get_students_list(
        db=db,
        search=search,
        semester=semester,
        risk_category=risk_category,
        limit=limit,
        offset=offset
    )

@router.get("/{student_id}")
def get_student_detail(student_id: str, db: Session = Depends(get_db)):
    """
    Retrieves full longitudinal history across 16 weeks for a specific student.
    """
    res = StudentService.get_student_detail(student_id, db)
    if not res:
        raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found.")
    return res
