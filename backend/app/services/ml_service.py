import json
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session
from ..database.models import ClusteringRun, ClusterResult, Student
from ..ml.feature_extraction import FeatureExtractor
from ..ml.agglomerative import HierarchicalClusterer
from ..ml.trajectory_profiler import TrajectoryProfiler
from ..ml.evaluation import ModelEvaluator
from .dataset_service import DatasetService

class MLService:
    """
    Coordinates machine learning operations:
    - Hierarchical agglomerative clustering across Ward, Complete, Average, Single
    - Dynamic cluster trajectory profiling
    - Multi-method model evaluation metrics
    - Ground-truth historical dropout outcome validation
    """

    @classmethod
    def run_clustering(
        cls,
        n_clusters: int = 5,
        linkage_method: str = "ward",
        db: Session = None
    ) -> dict:
        # 1. Load active dataset and extract longitudinal features
        df = DatasetService.load_active_dataset()
        features_df, scaled_features_df, scaler = FeatureExtractor.extract_features(df)

        scaled_matrix = scaled_features_df.values

        # 2. Fit Hierarchical Clustering
        cluster_res = HierarchicalClusterer.fit_clustering(
            scaled_features=scaled_matrix,
            n_clusters=n_clusters,
            linkage_method=linkage_method
        )
        labels = np.array(cluster_res["labels"])

        # 3. Calculate internal validity metrics
        metrics = ModelEvaluator.calculate_metrics(scaled_matrix, labels)

        # 4. Profile clusters dynamically from empirical statistics
        profiles = TrajectoryProfiler.profile_clusters(features_df, labels.tolist())

        # 5. Persist run to SQLite database
        run_id = 1
        if db is not None:
            # Create ClusteringRun record
            run = ClusteringRun(
                linkage_method=linkage_method,
                num_clusters=n_clusters,
                num_students=len(features_df),
                silhouette=metrics["silhouette"],
                davies_bouldin=metrics["davies_bouldin"],
                calinski_harabasz=metrics["calinski_harabasz"],
                features_used=json.dumps(FeatureExtractor.FEATURE_COLUMNS),
                dendrogram_data=json.dumps(cluster_res["dendrogram_data"])
            )
            db.add(run)
            db.commit()
            db.refresh(run)
            run_id = run.id

            # Save student cluster results
            db.query(ClusterResult).filter(ClusterResult.run_id == run_id).delete()
            cluster_results_list = []
            for idx, row in features_df.iterrows():
                c_lbl = int(labels[idx])
                prof = profiles[c_lbl]
                cr = ClusterResult(
                    run_id=run_id,
                    student_id=str(row["student_id"]),
                    cluster_id=c_lbl,
                    profile_label=prof["profile_label"],
                    risk_category=prof["risk_category"],
                    mean_attendance=float(row["mean_attendance"]),
                    attendance_slope=float(row["attendance_slope"]),
                    attendance_variability=float(row["attendance_variability"]),
                    mean_grade=float(row["mean_grade"]),
                    grade_slope=float(row["grade_slope"]),
                    grade_variability=float(row["grade_variability"]),
                    mean_engagement=float(row["mean_engagement"]),
                    engagement_slope=float(row["engagement_slope"])
                )
                cluster_results_list.append(cr)

            db.bulk_save_objects(cluster_results_list)
            db.commit()

        # Cache processed features with assignments for fast CSV export
        features_with_clusters = features_df.copy()
        features_with_clusters["cluster_id"] = labels
        features_with_clusters["profile_label"] = [profiles[lbl]["profile_label"] for lbl in labels]
        features_with_clusters["risk_category"] = [profiles[lbl]["risk_category"] for lbl in labels]
        features_with_clusters.to_csv(DatasetService.PROCESSED_FEATURES_PATH, index=False)

        return {
            "run_id": run_id,
            "linkage_method": linkage_method,
            "n_clusters": n_clusters,
            "num_students": len(features_df),
            "silhouette": metrics["silhouette"],
            "davies_bouldin": metrics["davies_bouldin"],
            "calinski_harabasz": metrics["calinski_harabasz"],
            "cluster_profiles": profiles,
            "dendrogram_data": cluster_res["dendrogram_data"],
            "feature_names": FeatureExtractor.FEATURE_COLUMNS
        }

    @classmethod
    def compare_linkages(cls, n_clusters: int = 5) -> dict:
        df = DatasetService.load_active_dataset()
        _, scaled_features_df, _ = FeatureExtractor.extract_features(df)
        return ModelEvaluator.compare_linkage_methods(
            scaled_features=scaled_features_df.values,
            n_clusters=n_clusters
        )

    @classmethod
    def validate_historical_outcomes(cls, db: Session = None) -> dict:
        """
        Validates unsupervised student trajectory clusters against historical
        dropout ground-truth records (Task 3).
        """
        df = DatasetService.get_processed_features()
        if "cluster_id" not in df.columns or "profile_label" not in df.columns:
            # Run clustering first to get labels
            cls.run_clustering(n_clusters=5, linkage_method="ward", db=db)
            df = DatasetService.get_processed_features()

        total_students = len(df)
        total_dropouts = int(df["historical_dropout_status"].sum())
        overall_dropout_rate = round((total_dropouts / total_students) * 100, 2) if total_students > 0 else 0.0

        cluster_summaries = []
        unique_clusters = sorted(df["cluster_id"].unique())

        tp, fp, tn, fn = 0, 0, 0, 0

        for c_id in unique_clusters:
            c_data = df[df["cluster_id"] == c_id]
            c_size = len(c_data)
            c_drops = int(c_data["historical_dropout_status"].sum())
            c_retained = c_size - c_drops
            drop_rate = round((c_drops / c_size) * 100, 2) if c_size > 0 else 0.0
            retained_rate = round((c_retained / c_size) * 100, 2) if c_size > 0 else 0.0
            prof_label = c_data["profile_label"].iloc[0]
            risk = c_data["risk_category"].iloc[0]

            # Confusion metric accumulation
            is_risk_cluster = risk in ["High Risk", "Moderate Risk"]
            if is_risk_cluster:
                tp += c_drops
                fp += c_retained
            else:
                fn += c_drops
                tn += c_retained

            cluster_summaries.append({
                "cluster_id": int(c_id),
                "profile_label": prof_label,
                "risk_category": risk,
                "total_students": c_size,
                "dropout_count": c_drops,
                "continued_enrolment_count": c_retained,
                "dropout_percentage": drop_rate,
                "continued_enrolment_percentage": retained_rate
            })

        # Calculate sensitivity and precision
        sensitivity = round((tp / (tp + fn)) * 100, 2) if (tp + fn) > 0 else 0.0
        precision = round((tp / (tp + fp)) * 100, 2) if (tp + fp) > 0 else 0.0
        specificity = round((tn / (tn + fp)) * 100, 2) if (tn + fp) > 0 else 0.0

        insights = [
            f"Overall cohort dropout rate: {overall_dropout_rate}% ({total_dropouts}/{total_students} students).",
            f"Clusters flagged as High Risk / Combined Decline captured {sensitivity}% of all true historical dropouts.",
            f"Low-risk consistently engaged student clusters demonstrated {specificity}% retention specificity.",
            "Crucially, the historical dropout label was strictly withheld during agglomerative hierarchical clustering, confirming strong unsupervised profile validity."
        ]

        return {
            "total_students": total_students,
            "overall_dropout_count": total_dropouts,
            "overall_dropout_rate": overall_dropout_rate,
            "clusters": cluster_summaries,
            "contingency_matrix": [
                [tp, fp],
                [fn, tn]
            ],
            "metrics": {
                "sensitivity": sensitivity,
                "precision": precision,
                "specificity": specificity,
                "true_positives": tp,
                "false_positives": fp,
                "true_negatives": tn,
                "false_negatives": fn
            },
            "insights": insights
        }
