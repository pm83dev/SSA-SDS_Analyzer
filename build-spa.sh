#!/bin/bash
# Build script for SSA-SDS SPA deployment
# This script builds the Angular frontend and copies it to the API's wwwroot folder

set -e

echo "=== Building SSA-SDS SPA ==="

# Get the root directory
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend/sds-frontend"
API_DIR="$ROOT_DIR/api/SSA.SDS.Api"

echo "1. Building Angular frontend..."
cd "$FRONTEND_DIR"
npm install
npm run build -- --configuration production

echo "2. Cleaning API wwwroot folder..."
mkdir -p "$API_DIR/wwwroot"
rm -rf "$API_DIR/wwwroot"/*

echo "3. Copying Angular build to API wwwroot..."
cp -r "$FRONTEND_DIR/dist/sds-frontend/browser/"* "$API_DIR/wwwroot/"

echo "4. Building .NET API..."
cd "$API_DIR"
dotnet build -c Release

echo "=== Build complete! ==="
echo "The SPA is ready for deployment."
echo "API + Frontend are now in: $API_DIR"