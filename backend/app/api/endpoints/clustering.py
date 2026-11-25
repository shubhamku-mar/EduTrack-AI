from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ...database.connection import get_db
from ...services.ml_service import MLService
from ...schemas.clustering import ClusteringRunRequest, ClusteringRunResponse, LinkageComparisonResponse, HistoricalValidationSummary

router = APIRouter(prefix="/clustering", tags=["Hierarchical Clustering"])

@router.post("/run", response_model=ClusteringRunResponse)
def execute_clustering(
    req: ClusteringRunRequest,
    db: Session = Depends(get_db)
):
    """
    Executes Agglomerative Hierarchical Clustering with chosen linkage and cluster count k.
    Extracts dynamic trajectory profiles, dendrogram data, and internal validation metrics.
    """
    return MLService.run_clustering(
        n_clusters=req.n_clusters,
        linkage_method=req.linkage_method,
        db=db
    )

@router.get("/compare", response_model=LinkageComparisonResponse)
def compare_linkages(n_clusters: int = Query(5, ge=2, le=10)):
    """
    Objective 2: Evaluates and compares all four hierarchical linkage methods
    (Ward, Complete, Average, Single) using Silhouette, Davies-Bouldin, and Calinski-Harabasz.
    """
    return MLService.compare_linkages(n_clusters=n_clusters)

@router.get("/validation", response_model=HistoricalValidationSummary)
def validate_against_historical_outcomes(db: Session = Depends(get_db)):
    """
    Objective 3: Validates unsupervised cluster trajectory profiles against historical
    dropout and academic failure case records. Note: dropout status was withheld from clustering.
    """
    return MLService.validate_historical_outcomes(db=db)

@router.get("/profiles")
def get_trajectory_profiles(db: Session = Depends(get_db)):
    """
    Returns the statistical trajectory profiles and recommendations for the current clustering.
    """
    res = MLService.run_clustering(n_clusters=5, linkage_method="ward", db=db)
    return {
        "cluster_profiles": res["cluster_profiles"],
        "n_clusters": res["n_clusters"],
        "linkage_method": res["linkage_method"]
    }
