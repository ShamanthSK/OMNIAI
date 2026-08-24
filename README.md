# OmniAI — Multi-Model AI Agent Platform

> **"One question. Multiple intelligences."**

OmniAI is a production-ready, customer-facing AI agent application engineered specifically to satisfy **Track 1: Build and Deploy a Customer-Facing AI Agent**. It unifies top-tier AI models (Google Gemini, OpenAI GPT, Anthropic Claude, and xAI Grok) into a single intelligent workspace featuring automated request classification, model routing, RAG document intelligence, parallel execution, and automated consensus synthesis.

---

## 🌟 Key Features

### 1. Three Core Interaction Modes
* **Mode A — Auto (Intelligent Agent Routing)**: The OmniAI Agent classifies user intent (Coding, Writing, Research, Data Analysis, Reasoning) and routes the request to the optimal configured provider with a human-readable routing explanation (e.g. *"OmniAI selected Gemini for coding & rapid execution"*).
* **Mode B — Single Model**: Direct execution through a manually selected AI provider (Gemini 2.5, GPT-4o, Claude 3.5 Sonnet, Grok 2).
* **Mode C — Compare Models Parallel**: Executes queries across multiple AI models concurrently. Displays side-by-side responses alongside an **OmniAI Synthesis Card** detailing consensus points, model discrepancies, hallucination warnings, and a unified best answer.

### 2. RAG & Knowledge Base System
* **Multi-Format Support**: Upload PDF, DOCX, CSV, TXT, and Markdown documents.
* **Vector Storage & Semantic Retrieval**: Text extraction, token-aware chunking, vector embedding generation, and cosine similarity context injection.
* **Citations & Sources**: Displays source file references, chunk indices, and relevance scores inline with assistant responses.

### 3. Provider Abstraction Layer & Fault Tolerance
* **Abstract Provider Interface**: Common `AIProvider` base class decoupling model-specific APIs.
* **Graceful Degradation & Demo Mode**: If API keys (`GEMINI_API_KEY`, `OPENAI_API_KEY`, etc.) are missing, OmniAI degrades to a realistic **Demo Provider** mode with mock intelligent responses so reviewers can test all user flows out-of-the-box without setup errors.

### 4. Premium Customer-Facing Interface
* **Modern UI/UX**: Dark mode workspace with glassmorphism, responsive drawer navigation, custom scrollbars, and glowing accents.
* **Markdown & Syntax Highlighting**: Clean text formatting, table rendering, inline code blocks, copy actions, and feedback tracking.

---

## 📐 AI Agent Pipeline Architecture

```
USER INPUT
   │
   ▼
REQUEST CLASSIFICATION ──► Intent: [Coding | Research | Writing | Document QA | Reasoning]
   │
   ▼
CONTEXT CHECK ──────────► Uploaded Documents Present?
   │                       ├─► YES: Retrieve RAG Vector Context & Source Citations
   │                       └─► NO:  Proceed to Routing
   ▼
MODEL ROUTING ──────────► Selected Mode: [Auto | Single | Compare]
   │                       ├─► AUTO: Route to highest-ranked available model for category
   │                       ├─► SINGLE: Route to user-chosen provider
   │                       └─► COMPARE: Dispatch parallel async requests to all providers
   ▼
MODEL EXECUTION ────────► Fault-Tolerant Async API Calls (Gemini, GPT, Claude, Grok)
   │
   ▼
MULTI-MODEL SYNTHESIS ──► Compare Mode: Detect agreements, discrepancies, hallucination risks
   │
   ▼
FINAL RESPONSE ─────────► Synthesized Answer + Citations + Action Toolbar
```

---

## 🛠️ Tech Stack

* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, React Markdown, Remark GFM.
* **Backend**: Python 3.11+, FastAPI, Uvicorn, SQLAlchemy (Async), Pydantic v2.
* **AI & RAG**: Google GenAI SDK, OpenAI SDK, Anthropic SDK, PyPDF, python-docx, Pandas, Cosine Similarity Vector Store.
* **Deployment**: Docker (Multi-stage build), Google Cloud Run single-container architecture.

---

## 🚀 Quickstart & Local Setup

### 1. Clone & Setup Environment

```bash
# Copy template environment file
cp .env.example .env
```

Add your optional API keys to `.env` (`GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `XAI_API_KEY`). Unconfigured keys will automatically fall back to Demo Mode.

### 2. Run Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
python app/main.py
```
Backend server runs at `http://localhost:8080`.

### 3. Run Frontend (React Vite)

```bash
cd frontend
npm install
npm run dev
```
Frontend dev server runs at `http://localhost:5173`.

---

## ☁️ Production Deployment (Google Cloud Run)

OmniAI uses a single-container architecture where FastAPI serves the built Vite static frontend assets directly:

```bash
# Build multi-stage container image
docker build -t omniai:latest .

# Run container locally
docker run -p 8080:8080 omniai:latest
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for full GCP Cloud Run deployment commands using `gcloud` CLI and Secret Manager.

---

## 🧪 Testing

Run backend pytest unit tests:

```bash
cd backend
python -m pytest tests
```

Build production frontend bundle:

```bash
cd frontend
npm run build
```

---

## 🔒 Security & Privacy

- API keys are strictly loaded backend-side via environment variables / GCP Secret Manager and never exposed to the browser.
- File upload limits (25MB) and mime type validation enforced.
- CORS policy restricts unauthorized origins.
