@echo off
echo ========================================================
echo Starting OmniAI App (Backend + Frontend Dev Servers)
echo ========================================================

:: Start backend in a new command window
start cmd /k "echo Starting Backend... && cd backend && uvicorn app.main:app --port 8080 --reload"

:: Run frontend in the current window
echo Starting Frontend...
cd frontend && npm run dev
