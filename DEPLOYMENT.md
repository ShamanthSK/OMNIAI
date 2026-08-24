# Google Cloud Run Deployment Guide — OmniAI

This document provides step-by-step instructions for building, containerizing, and deploying **OmniAI** to **Google Cloud Run** to satisfy **Track 1: Build and Deploy a Customer-Facing AI Agent**.

---

## 1. Prerequisites & GCP Initial Setup

Before deploying, ensure you have:
- A Google Cloud Platform (GCP) account.
- The `gcloud` CLI installed and authenticated.
- Docker installed locally.

### Enable Required GCP APIs
Run the following command to enable Artifact Registry, Cloud Build, and Cloud Run:

```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com
```

---

## 2. Environment Variables & Secret Manager Setup

Store your API keys securely in Google Cloud Secret Manager so they are never exposed to the frontend client.

```bash
# Create Secrets in Secret Manager
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "your-gemini-api-key" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

gcloud secrets create OPENAI_API_KEY --replication-policy="automatic"
echo -n "your-openai-api-key" | gcloud secrets versions add OPENAI_API_KEY --data-file=-

gcloud secrets create ANTHROPIC_API_KEY --replication-policy="automatic"
echo -n "your-anthropic-api-key" | gcloud secrets versions add ANTHROPIC_API_KEY --data-file=-

gcloud secrets create XAI_API_KEY --replication-policy="automatic"
echo -n "your-xai-api-key" | gcloud secrets versions add XAI_API_KEY --data-file=-
```

*(Note: If any API key is left unconfigured, OmniAI will automatically degrade to Demo Mode for that specific provider without breaking the application).*

---

## 3. Local Container Build & Verification

Before pushing to GCP, verify the multi-stage Docker build locally:

```bash
# Build container image locally
docker build -t omniai:latest .

# Run container locally on port 8080
docker run -p 8080:8080 \
  -e ENVIRONMENT=production \
  -e GEMINI_API_KEY="your-key-here" \
  omniai:latest
```

Open `http://localhost:8080` in your browser. The built React Vite UI will be served directly by the FastAPI server!

---

## 4. Deploying to Google Cloud Run

### Option A: Using Google Cloud Build & Artifact Registry (Recommended)

```bash
# Set your GCP Project ID
export PROJECT_ID=$(gcloud config get-value project)
export REGION="us-central1"

# Create Artifact Registry Repository
gcloud artifacts repositories create omniai-repo \
  --repository-format=docker \
  --location=$REGION \
  --description="OmniAI Container Repository"

# Build and Push Image
gcloud builds submit --tag $REGION-docker.pkg.dev/$PROJECT_ID/omniai-repo/omniai:latest .

# Deploy to Cloud Run
gcloud run deploy omniai \
  --image $REGION-docker.pkg.dev/$PROJECT_ID/omniai-repo/omniai:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars ENVIRONMENT=production \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --set-secrets OPENAI_API_KEY=OPENAI_API_KEY:latest \
  --set-secrets ANTHROPIC_API_KEY=ANTHROPIC_API_KEY:latest \
  --set-secrets XAI_API_KEY=XAI_API_KEY:latest
```

---

## 5. Verification & Health Monitoring

Once deployment completes, Cloud Run will output your live URL (e.g. `https://omniai-xyz-uc.a.run.app`).

1. **Root UI Verification**: Navigate to `https://omniai-xyz-uc.a.run.app` to view the production application.
2. **Backend Health Check**: Navigate to `https://omniai-xyz-uc.a.run.app/api/health` to verify provider registry status.
3. **OpenAPI Interactive Documentation**: Navigate to `https://omniai-xyz-uc.a.run.app/docs`.

---

## 6. Troubleshooting & Logs

View real-time deployment logs:

```bash
gcloud logs read --service=omniai --limit=50
```

If memory issues occur during heavy RAG document embeddings, scale container memory:

```bash
gcloud run services update omniai --memory 2Gi --cpu 2
```
