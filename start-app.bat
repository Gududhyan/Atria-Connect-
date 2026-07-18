@echo off
cd /d "c:\Users\Dhyan v\Desktop\no-dues-project\NO-DUE"
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3
start "Frontend Server" cmd /k "cd frontend && npm run dev"
echo Both servers are starting...
echo Frontend will be available at http://localhost:5173
echo Backend API at http://localhost:5000
