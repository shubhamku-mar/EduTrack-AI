from sqlalchemy import Column, Integer, Float, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
import datetime
from .connection import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=True)
    semester = Column(Integer, default=1)
    department = Column(String(100), default="Computer Science & Engineering")
    historical_dropout_status = Column(Integer, default=0) # 0 = Continued, 1 = Dropped Out
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    records = relationship("LongitudinalRecord", back_populates="student", cascade="all, delete-orphan")
    cluster_results = relationship("ClusterResult", back_populates="student", cascade="all, delete-orphan")

class LongitudinalRecord(Base):
    __tablename__ = "longitudinal_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey("students.student_id"), nullable=False, index=True)
    week = Column(Integer, nullable=False)
    classes_held = Column(Integer, default=15)
    classes_attended = Column(Integer, default=12)
    attendance_percentage = Column(Float, nullable=False)
    assignment_score = Column(Float, default=70.0)
    quiz_score = Column(Float, default=70.0)
    internal_assessment_score = Column(Float, default=70.0)
    lms_logins = Column(Integer, default=10)
    study_hours = Column(Float, default=10.0)
    assignment_submission_rate = Column(Float, default=85.0)
    engagement_score = Column(Float, default=75.0)

    student = relationship("Student", back_populates="records")

class ClusteringRun(Base):
    __tablename__ = "clustering_runs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    linkage_method = Column(String(50), nullable=False) # 'ward', 'complete', 'average', 'single'
    num_clusters = Column(Integer, nullable=False)
    num_students = Column(Integer, nullable=False)
    silhouette = Column(Float, nullable=True)
    davies_bouldin = Column(Float, nullable=True)
    calinski_harabasz = Column(Float, nullable=True)
    features_used = Column(Text, nullable=True) # JSON list
    dendrogram_data = Column(Text, nullable=True) # JSON representation of dendrogram coordinates

    results = relationship("ClusterResult", back_populates="run", cascade="all, delete-orphan")

class ClusterResult(Base):
    __tablename__ = "cluster_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    run_id = Column(Integer, ForeignKey("clustering_runs.id"), nullable=False, index=True)
    student_id = Column(String(50), ForeignKey("students.student_id"), nullable=False, index=True)
    cluster_id = Column(Integer, nullable=False)
    profile_label = Column(String(100), nullable=False)
    risk_category = Column(String(50), nullable=False) # 'Low Risk', 'Moderate Risk', 'High Risk', 'Recovering'
    
    # Cached student trajectory features for fast query
    mean_attendance = Column(Float, nullable=True)
    attendance_slope = Column(Float, nullable=True)
    attendance_variability = Column(Float, nullable=True)
    mean_grade = Column(Float, nullable=True)
    grade_slope = Column(Float, nullable=True)
    grade_variability = Column(Float, nullable=True)
    mean_engagement = Column(Float, nullable=True)
    engagement_slope = Column(Float, nullable=True)

    run = relationship("ClusteringRun", back_populates="results")
    student = relationship("Student", back_populates="cluster_results")
