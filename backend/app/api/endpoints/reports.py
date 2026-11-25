from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from ...database.connection import get_db
from ...services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/csv")
def download_csv_report():
    """
    Downloads comprehensive CSV report containing student-level trajectory features,
    cluster assignments, and historical outcomes.
    """
    csv_content = ReportService.generate_csv_report()
    return Response(
        content=csv_content.encode("utf-8"),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=student_risk_trajectories_report.csv"}
    )

@router.get("/pdf")
def download_pdf_report(db: Session = Depends(get_db)):
    """
    Generates and downloads professional multi-page vector PDF analysis report
    incorporating methodology, linkage metrics, trajectory profiles, and validation stats.
    """
    pdf_bytes = ReportService.generate_pdf_report(db=db)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=SIH26037_Student_Risk_Report.pdf"}
    )

@router.get("/summary")
def get_report_metadata():
    """
    Returns metadata regarding available report exports.
    """
    return {
        "project_id": "SIH26037",
        "title": "Hierarchical Clustering of Longitudinal Attendance and Grade-Trend Data to Reveal At-Risk Student Trajectories",
        "developer": "Shubham Kumar (RK3P24UKB35)",
        "institution": "Lovely Professional University",
        "available_formats": ["CSV", "PDF"],
        "included_sections": [
            "Executive Summary",
            "Dataset & Preprocessing Diagnostics",
            "Hierarchical Linkage Method Comparative Evaluation",
            "At-Risk Trajectory Profiles & Recommendations",
            "Historical Dropout Ground-Truth Validation"
        ]
    }
