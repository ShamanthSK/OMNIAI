# ========================================================
# OmniAI Multi-Stage Production Dockerfile for Google Cloud Run
# ========================================================

# Stage 1: Build React Vite Frontend
FROM node:24-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Final Production Runtime (Python FastAPI Backend + Served UI)
FROM python:3.11-slim AS runner

WORKDIR /app

# Install system dependencies for PDF / DOCX processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements & install dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/app ./app

# Copy built frontend static files from Stage 1 into backend static location
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose Cloud Run default PORT (8080)
ENV PORT=8080
ENV PYTHONPATH=/app
EXPOSE 8080

# Run Uvicorn server binding to 0.0.0.0:$PORT
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
