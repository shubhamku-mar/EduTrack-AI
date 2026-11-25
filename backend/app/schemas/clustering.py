from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ClusteringRunRequest(BaseModel):
    n_clusters: int = Field(default=5, ge=2, le=10)
    linkage_method: str = Field(default="ward")

class ClusterProfileSchema(BaseModel):
    cluster_id: int
    profile_label: str
    risk_category: str
    color: str
    description: str
    recommendation: str
    student_count: int
    percentage_of_cohort: float
    metrics: Dict[str, Any]

class ClusteringRunResponse(BaseModel):
    run_id: int
    linkage_method: str
    n_clusters: int
    num_students: int
    silhouette: float
    davies_bouldin: float
    calinski_harabasz: float
    cluster_profiles: Dict[int, ClusterProfileSchema]
    dendrogram_data: Dict[str, Any]
    feature_names: List[str]

class LinkageComparisonResponse(BaseModel):
    n_clusters: int
    best_method: str
    explanation: str
    linkage_comparisons: List[Dict[str, Any]]

class HistoricalValidationSummary(BaseModel):
    total_students: int
    overall_dropout_count: int
    overall_dropout_rate: float
    clusters: List[Dict[str, Any]]
    contingency_matrix: List[List[int]]
    insights: List[str]
