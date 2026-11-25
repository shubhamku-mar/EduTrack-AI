import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database.connection import Base, engine, SessionLocal
from .api.router import api_router
from .services.dataset_service import DatasetService

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    # Ensure baseline dataset and DB tables are populated
    db = SessionLocal()
    try:
        DatasetService.get_or_create_default_dataset(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="Hierarchical Clustering of Longitudinal Attendance and Grade-Trend Data (SIH26037)",
    description=(
        "Production-grade REST API for analyzing longitudinal student attendance and grade trends "
        "using Agglomerative Hierarchical Clustering (Ward, Complete, Average, Single linkage) "
        "to discover at-risk trajectory archetypes and validate against historical dropouts."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
def root():
    return {
        "title": "Hierarchical Clustering of Longitudinal Attendance and Grade-Trend Data",
        "project_id": "SIH26037",
        "developer": "Shubham Kumar (RK3P24UKB35)",
        "institution": "Lovely Professional University",
        "documentation": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
