from sqlalchemy.orm import Session
from sqlalchemy import func
import numpy as np
import pandas as pd
from typing import Optional, List, Dict, Any
from ..database.models import Student, LongitudinalRecord, ClusterResult, ClusteringRun
from .dataset_service import DatasetService

class StudentService:
    """
    Handles student querying, filtering, weekly trajectory time-series,
    and dashboard high-level aggregate analytics.
    """

    @classmethod
    def get_dashboard_stats(cls, db: Session) -> Dict[str, Any]:
        # Ensure data is populated
        DatasetService.get_or_create_default_dataset(db)

        total_students = db.query(Student).count()
        total_records = db.query(LongitudinalRecord).count()

        # Averages across all records
        avg_att = db.query(func.avg(LongitudinalRecord.attendance_percentage)).scalar() or 0.0
        avg_assign = db.query(func.avg(LongitudinalRecord.assignment_score)).scalar() or 0.0
        avg_quiz = db.query(func.avg(LongitudinalRecord.quiz_score)).scalar() or 0.0
        avg_ia = db.query(func.avg(LongitudinalRecord.internal_assessment_score)).scalar() or 0.0
        avg_grade = (avg_assign * 0.4 + avg_quiz * 0.3 + avg_ia * 0.3)
        avg_eng = db.query(func.avg(LongitudinalRecord.engagement_score)).scalar() or 0.0

        hist_dropouts = db.query(Student).filter(Student.historical_dropout_status == 1).count()

        # Risk distribution from most recent cluster results
        latest_run = db.query(ClusteringRun).order_by(ClusteringRun.id.desc()).first()
        risk_dist = {
            "Low Risk": 0,
            "Moderate Risk": 0,
            "High Risk": 0,
            "Recovering": 0
        }
        at_risk_count = 0

        if latest_run:
            c_results = db.query(ClusterResult).filter(ClusterResult.run_id == latest_run.id).all()
            for r in c_results:
                cat = r.risk_category or "Low Risk"
                if cat in risk_dist:
                    risk_dist[cat] += 1
                else:
                    risk_dist[cat] = 1
                if cat in ["High Risk", "Moderate Risk"]:
                    at_risk_count += 1
        else:
            # Fallback estimation before first run
            features_df = DatasetService.get_processed_features()
            if "risk_category" in features_df.columns:
                for cat, count in features_df["risk_category"].value_counts().items():
                    risk_dist[cat] = int(count)
                    if cat in ["High Risk", "Moderate Risk"]:
                        at_risk_count += int(count)

        # Weekly cohort trajectory trends across all 16 weeks
        weekly_stats = []
        for w in range(1, 17):
            w_recs = db.query(
                func.avg(LongitudinalRecord.attendance_percentage),
                func.avg(LongitudinalRecord.assignment_score),
                func.avg(LongitudinalRecord.quiz_score),
                func.avg(LongitudinalRecord.internal_assessment_score),
                func.avg(LongitudinalRecord.engagement_score),
                func.avg(LongitudinalRecord.lms_logins)
            ).filter(LongitudinalRecord.week == w).first()

            if w_recs and w_recs[0] is not None:
                w_grade = float(w_recs[1] or 0)*0.4 + float(w_recs[2] or 0)*0.3 + float(w_recs[3] or 0)*0.3
                weekly_stats.append({
                    "week": w,
                    "avg_attendance": round(float(w_recs[0]), 2),
                    "avg_grade": round(w_grade, 2),
                    "avg_engagement": round(float(w_recs[4] or 0), 2),
                    "avg_logins": round(float(w_recs[5] or 0), 1)
                })

        return {
            "total_students": total_students,
            "total_academic_records": total_records,
            "average_attendance": round(float(avg_att), 2),
            "average_grade": round(float(avg_grade), 2),
            "average_engagement": round(float(avg_eng), 2),
            "at_risk_students": at_risk_count,
            "historical_dropouts": hist_dropouts,
            "risk_distribution": risk_dist,
            "weekly_trends": weekly_stats,
            "project_metadata": {
                "project_title": "Hierarchical Clustering of Longitudinal Attendance and Grade-Trend Data to Reveal At-Risk Student Trajectories",
                "project_id": "SIH26037",
                "developer": "Shubham Kumar",
                "institution": "Lovely Professional University",
                "course_code": "INT396"
            }
        }

    @classmethod
    def get_students_list(
        cls,
        db: Session,
        search: Optional[str] = None,
        semester: Optional[int] = None,
        risk_category: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> Dict[str, Any]:
        DatasetService.get_or_create_default_dataset(db)

        # Get latest cluster results lookup
        latest_run = db.query(ClusteringRun).order_by(ClusteringRun.id.desc()).first()
        cluster_map = {}
        if latest_run:
            c_res = db.query(ClusterResult).filter(ClusterResult.run_id == latest_run.id).all()
            for r in c_res:
                cluster_map[r.student_id] = {
                    "cluster_id": r.cluster_id,
                    "profile_label": r.profile_label,
                    "risk_category": r.risk_category,
                    "mean_attendance": r.mean_attendance,
                    "attendance_slope": r.attendance_slope,
                    "mean_grade": r.mean_grade,
                    "grade_slope": r.grade_slope
                }
        else:
            # Fallback to processed features CSV
            feat_df = DatasetService.get_processed_features()
            for _, row in feat_df.iterrows():
                cluster_map[str(row["student_id"])] = {
                    "cluster_id": int(row.get("cluster_id", 0)),
                    "profile_label": str(row.get("profile_label", "Consistently Engaged")),
                    "risk_category": str(row.get("risk_category", "Low Risk")),
                    "mean_attendance": float(row.get("mean_attendance", 0)),
                    "attendance_slope": float(row.get("attendance_slope", 0)),
                    "mean_grade": float(row.get("mean_grade", 0)),
                    "grade_slope": float(row.get("grade_slope", 0))
                }

        query = db.query(Student)

        if search:
            query = query.filter(
                (Student.student_id.ilike(f"%{search}%")) |
                (Student.name.ilike(f"%{search}%")) |
                (Student.department.ilike(f"%{search}%"))
            )

        if semester:
            query = query.filter(Student.semester == semester)

        all_students = query.all()

        results = []
        for s in all_students:
            c_info = cluster_map.get(s.student_id, {})
            risk = c_info.get("risk_category", "Low Risk")

            if risk_category and risk_category.lower() != "all" and risk != risk_category:
                continue

            results.append({
                "student_id": s.student_id,
                "name": s.name or s.student_id,
                "semester": s.semester,
                "department": s.department,
                "historical_dropout_status": s.historical_dropout_status,
                "cluster_id": c_info.get("cluster_id"),
                "profile_label": c_info.get("profile_label", "Unassigned"),
                "risk_category": risk,
                "mean_attendance": c_info.get("mean_attendance"),
                "attendance_slope": c_info.get("attendance_slope"),
                "mean_grade": c_info.get("mean_grade"),
                "grade_slope": c_info.get("grade_slope")
            })

        total_count = len(results)
        paginated = results[offset : offset + limit]

        return {
            "total": total_count,
            "students": paginated,
            "limit": limit,
            "offset": offset
        }

    @classmethod
    def get_student_detail(cls, student_id: str, db: Session) -> Optional[Dict[str, Any]]:
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            return None

        records = (
            db.query(LongitudinalRecord)
            .filter(LongitudinalRecord.student_id == student_id)
            .order_by(LongitudinalRecord.week.asc())
            .all()
        )

        record_list = []
        for r in records:
            comp_grade = round(r.assignment_score * 0.4 + r.quiz_score * 0.3 + r.internal_assessment_score * 0.3, 2)
            record_list.append({
                "week": r.week,
                "classes_held": r.classes_held,
                "classes_attended": r.classes_attended,
                "attendance_percentage": r.attendance_percentage,
                "assignment_score": r.assignment_score,
                "quiz_score": r.quiz_score,
                "internal_assessment_score": r.internal_assessment_score,
                "composite_grade": comp_grade,
                "lms_logins": r.lms_logins,
                "study_hours": r.study_hours,
                "assignment_submission_rate": r.assignment_submission_rate,
                "engagement_score": r.engagement_score
            })

        # Cluster result
        latest_c = (
            db.query(ClusterResult)
            .filter(ClusterResult.student_id == student_id)
            .order_by(ClusterResult.id.desc())
            .first()
        )

        summary = {}
        if latest_c:
            summary = {
                "cluster_id": latest_c.cluster_id,
                "profile_label": latest_c.profile_label,
                "risk_category": latest_c.risk_category,
                "mean_attendance": latest_c.mean_attendance,
                "attendance_slope": latest_c.attendance_slope,
                "attendance_variability": latest_c.attendance_variability,
                "mean_grade": latest_c.mean_grade,
                "grade_slope": latest_c.grade_slope,
                "grade_variability": latest_c.grade_variability,
                "mean_engagement": latest_c.mean_engagement,
                "engagement_slope": latest_c.engagement_slope
            }

        return {
            "student_id": student.student_id,
            "name": student.name,
            "semester": student.semester,
            "department": student.department,
            "historical_dropout_status": student.historical_dropout_status,
            "records": record_list,
            "trajectory_summary": summary
        }
