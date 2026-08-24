import sys
import os

# Add backend directory to path so imports work correctly inside Vercel Serverless environment
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app
