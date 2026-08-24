Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting OmniAI App (Backend + Frontend Dev Servers)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# Start backend in a new PowerShell window
Start-Process powershell -ArgumentList "cd backend; uvicorn app.main:app --port 8080 --reload"

# Start frontend in the current session
Write-Host "Starting Frontend..." -ForegroundColor Yellow
cd frontend
npm run dev
