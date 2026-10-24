@echo off
REM Build script for SSA-SDS SPA deployment
REM This script builds the Angular frontend and copies it to the API's wwwroot folder

setlocal enabledelayedexpansion

echo === Building SSA-SDS SPA ===

REM Get the root directory
set ROOT_DIR=%~dp0
set FRONTEND_DIR=%ROOT_DIR%frontend\sds-frontend
set API_DIR=%ROOT_DIR%api\SSA.SDS.Api

echo 1. Building Angular frontend...
cd /d "%FRONTEND_DIR%"
call npm install
call npm run build -- --configuration production
if %errorlevel% neq 0 (
    echo ERROR: Angular build failed!
    exit /b 1
)

echo 2. Cleaning API wwwroot folder...
if exist "%API_DIR%\wwwroot" (
    rmdir /s /q "%API_DIR%\wwwroot"
)
mkdir "%API_DIR%\wwwroot"

echo 3. Copying Angular build to API wwwroot...
xcopy /E /I /Y "%FRONTEND_DIR%\dist\sds-frontend\browser\*" "%API_DIR%\wwwroot\"

echo 4. Building .NET API...
cd /d "%API_DIR%"
dotnet build -c Release
if %errorlevel% neq 0 (
    echo ERROR: .NET build failed!
    exit /b 1
)

echo === Build complete! ===
echo The SPA is ready for deployment.
echo API + Frontend are now in: %API_DIR%

endlocal