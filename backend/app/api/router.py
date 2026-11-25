from fastapi import APIRouter
from .endpoints.analytics import router as analytics_router
from .endpoints.students import router as students_router
from .endpoints.datasets import router as datasets_router
from .endpoints.clustering import router as clustering_router
from .endpoints.reports import router as reports_router

api_router = APIRouter(prefix="/api")

api_router.include_router(analytics_router)
api_router.include_router(students_router)
api_router.include_router(datasets_router)
api_router.include_router(clustering_router)
api_router.include_router(reports_router)

@api_router.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "Student Risk Analytics API",
        "version": "1.0.0",
        "project_id": "SIH26037"
    }
