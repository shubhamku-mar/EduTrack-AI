import numpy as np
from sklearn.metrics import silhouette_score, davies_bouldin_score, calinski_harabasz_score
from scipy.cluster.hierarchy import linkage
from sklearn.cluster import AgglomerativeClustering
from typing import Dict, Any, List

class ModelEvaluator:
    """
    Computes rigorous internal cluster validity metrics:
    - Silhouette Score (Separation & Cohesion, -1 to 1)
    - Davies-Bouldin Index (Similarity measure, lower is better)
    - Calinski-Harabasz Score (Variance ratio, higher is better)
    Compares all four hierarchical linkage methods with analytical explanations.
    """

    @staticmethod
    def calculate_metrics(scaled_features: np.ndarray, labels: np.ndarray) -> Dict[str, float]:
        """
        Calculates validation indices for a set of cluster assignments.
        """
        n_clusters = len(np.unique(labels))
        if n_clusters < 2 or n_clusters >= len(scaled_features):
            return {
                "silhouette": 0.0,
                "davies_bouldin": 0.0,
                "calinski_harabasz": 0.0
            }

        sil = float(silhouette_score(scaled_features, labels))
        db = float(davies_bouldin_score(scaled_features, labels))
        ch = float(calinski_harabasz_score(scaled_features, labels))

        return {
            "silhouette": round(sil, 4),
            "davies_bouldin": round(db, 4),
            "calinski_harabasz": round(ch, 2)
        }

    @classmethod
    def compare_linkage_methods(
        cls,
        scaled_features: np.ndarray,
        n_clusters: int = 5
    ) -> Dict[str, Any]:
        """
        Runs and evaluates all four linkage strategies on identical scaled features.
        Provides rank-ordering and mathematical reasoning.
        """
        linkages = ["ward", "complete", "average", "single"]
        comparison_results = []

        for link in linkages:
            try:
                agg = AgglomerativeClustering(
                    n_clusters=n_clusters,
                    linkage=link,
                    metric="euclidean"
                )
                labels = agg.fit_predict(scaled_features)
                metrics = cls.calculate_metrics(scaled_features, labels)

                # Cluster size balance
                counts = np.bincount(labels, minlength=n_clusters)
                size_entropy = float(-np.sum([
                    (c / len(labels)) * np.log(c / len(labels) + 1e-9)
                    for c in counts if c > 0
                ]))

                comparison_results.append({
                    "linkage_method": link,
                    "silhouette_score": metrics["silhouette"],
                    "davies_bouldin_index": metrics["davies_bouldin"],
                    "calinski_harabasz_index": metrics["calinski_harabasz"],
                    "cluster_distribution": counts.tolist(),
                    "cluster_balance_entropy": round(size_entropy, 3)
                })
            except Exception as e:
                comparison_results.append({
                    "linkage_method": link,
                    "error": str(e),
                    "silhouette_score": 0.0,
                    "davies_bouldin_index": 999.0,
                    "calinski_harabasz_index": 0.0
                })

        # Rank based on Silhouette Score (higher is better) and Davies-Bouldin (lower is better)
        sorted_by_sil = sorted(
            [r for r in comparison_results if "error" not in r],
            key=lambda x: (x["silhouette_score"], -x["davies_bouldin_index"]),
            reverse=True
        )

        best_method = sorted_by_sil[0]["linkage_method"] if sorted_by_sil else "ward"
        best_sil = sorted_by_sil[0]["silhouette_score"] if sorted_by_sil else 0.0
        best_db = sorted_by_sil[0]["davies_bouldin_index"] if sorted_by_sil else 0.0
        best_ch = sorted_by_sil[0]["calinski_harabasz_index"] if sorted_by_sil else 0.0

        explanation = (
            f"Based on internal cluster validity metrics, '{best_method.capitalize()}' linkage achieved "
            f"the strongest clustering partition with a Silhouette Score of {best_sil}, "
            f"Davies-Bouldin Index of {best_db}, and Calinski-Harabasz Index of {best_ch}. "
        )

        if best_method == "ward":
            explanation += (
                "Ward's minimum variance criterion optimizes the compact spherical distribution of longitudinal trajectories, "
                "effectively segregating distinct rate-of-decline profiles while preventing chaining artifacts common in single linkage."
            )
        elif best_method == "complete":
            explanation += (
                "Complete linkage enforces compact clusters with bounded maximum pairwise diameters, avoiding elongated clusters "
                "and cleanly separating outlying severe-decline trajectories."
            )
        elif best_method == "average":
            explanation += (
                "Average linkage balances pairwise variance without overly favoring equal-sized spheres, accommodating natural "
                "imbalances between high-performing cohorts and smaller at-risk subpopulations."
            )
        else:
            explanation += (
                "Single linkage links nearest neighbors but tends to suffer from the chaining phenomenon on longitudinal feature spaces."
            )

        return {
            "n_clusters": n_clusters,
            "best_method": best_method,
            "explanation": explanation,
            "linkage_comparisons": comparison_results
        }
