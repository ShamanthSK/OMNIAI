import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.core.config import settings
from app.core.database import init_db
from app.api import health, providers, documents, conversations, feedback, chat


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    await init_db()
    print(f"[{settings.PROJECT_NAME}] Database initialized successfully.")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="OmniAI — Unified Multi-Model AI Agent Platform",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api prefix
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(providers.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(conversations.router, prefix=settings.API_V1_STR)
app.include_router(feedback.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)

# Production Static File Mounting (Serves built React app from frontend/dist if present)
frontend_dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
if os.path.exists(frontend_dist_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist_path, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Ignore API calls
        if full_path.startswith("api"):
            return None
        file_path = os.path.join(frontend_dist_path, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        # Fallback to index.html for SPA routing
        return FileResponse(os.path.join(frontend_dist_path, "index.html"))
else:
    @app.get("/")
    async def root():
        return {
            "message": "OmniAI API Server Active.",
            "docs": "/docs",
            "status": "Running in API-only mode. Run `npm run build` in frontend directory to serve full UI."
        }
