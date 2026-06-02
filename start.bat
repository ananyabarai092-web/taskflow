@echo off
title To-Do App Launcher
color 0A

echo ========================================
echo   To-Do List Management System
echo ========================================
echo.

echo Starting Backend Server...
cd backend
start "Backend - Port 5000" cmd /k "node server.js"
timeout /t 3 /nobreak >nul
cd ..

echo Starting Frontend Server...
cd frontend
start "Frontend - Port 3000" cmd /k "npm start"
cd ..

echo.
echo ========================================
echo   Servers Started!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Register a new account to get started!
echo.
