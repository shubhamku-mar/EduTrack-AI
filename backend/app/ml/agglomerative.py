import numpy as np
import pandas as pd
from scipy.cluster.hierarchy import linkage, dendrogram, fcluster
from sklearn.cluster import AgglomerativeClustering
from typing import Dict, Any, List, Optional

class HierarchicalClusterer:
    """
    Executes Agglomerative Hierarchical Clustering with multiple linkage strategies:
    Ward, Complete, Average, and Single linkage. Computes dendrogram coordinates,
    optimal cutoffs, and cluster assignments.
    """

    VALID_LINKAGES = ["ward", "complete", "average", "single"]

    @classmethod
    def fit_clustering(
        cls,
        scaled_features: np.ndarray,
        n_clusters: int = 5,
        linkage_method: str = "ward",
        metric: str = "euclidean"
    ) -> Dict[str, Any]:
        """
        Fits hierarchical clustering and extracts dendrogram structures & assignments.
        """
        linkage_method = linkage_method.lower()
        if linkage_method not in cls.VALID_LINKAGES:
            raise ValueError(f"Invalid linkage '{linkage_method}'. Must be one of {cls.VALID_LINKAGES}")

        # Ward linkage requires euclidean metric
        if linkage_method == "ward":
            metric = "euclidean"

        # 1. Compute linkage matrix Z
        Z = linkage(scaled_features, method=linkage_method, metric=metric)

        # 2. Fit Scikit-Learn AgglomerativeClustering for cluster labels
        agg = AgglomerativeClustering(
            n_clusters=n_clusters,
            linkage=linkage_method,
            metric=metric
        )
        labels = agg.fit_predict(scaled_features)

        # 3. Compute cut-off distance for k clusters
        # The merge distance that splits into n_clusters is at index -(n_clusters - 1)
        if len(Z) >= (n_clusters - 1) and n_clusters > 1:
            threshold = float(Z[-(n_clusters - 1), 2])
        else:
            threshold = 0.0

        # 4. Generate truncated Dendrogram for visual rendering
        # We truncate to 30 top nodes/clusters for high-performance visual display
        dendro = dendrogram(
            Z,
            p=30,
            truncate_mode="lastp",
            color_threshold=threshold,
            no_plot=True
        )

        # Format dendrogram coordinates for clean JSON serialization
        dendro_chart_data = {
            "icoord": [[float(x) for x in branch] for branch in dendro["icoord"]],
            "dcoord": [[float(y) for y in branch] for branch in dendro["dcoord"]],
            "ivl": [str(lbl) for lbl in dendro["ivl"]],
            "leaves": [int(l) for l in dendro["leaves"]],
            "color_list": dendro["color_list"],
            "threshold": round(threshold, 3),
            "max_distance": round(float(np.max(Z[:, 2])), 3) if len(Z) > 0 else 0.0
        }

        return {
            "labels": labels.tolist(),
            "linkage_matrix": Z,
            "threshold": threshold,
            "dendrogram_data": dendro_chart_data,
            "n_clusters": n_clusters,
            "linkage_method": linkage_method
        }
