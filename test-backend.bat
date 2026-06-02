@echo off
echo Testing Backend Connection...
echo.

curl http://localhost:5000/health
echo.
echo.

echo Testing Login...
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@todoapp.com\",\"password\":\"Admin@123\"}"
echo.
echo.

pause
