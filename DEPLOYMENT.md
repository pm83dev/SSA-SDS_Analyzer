# 🚀 SSA-SDS SPA Deployment Guide

## 📦 Single-Page Application (SPA) Architecture

This project is now configured as a **single deployable unit** that combines:
- **ASP.NET Core API** (backend)
- **Angular Frontend** (static files)

Both are served from a **single port** (8080) and can be deployed to **IIS** as one site.

## 🏗️ How It Works

```
Browser → IIS (Port 80) → ASP.NET Core (Port 8080)
                                    ├── /api/* → API Controllers
                                    ├── /swagger/* → Swagger UI (dev only)
                                    └── /* → Angular Frontend (static files)
```

**Key Features:**
- ✅ Single port (no CORS issues)
- ✅ API calls use relative paths (`/api/...`)
- ✅ Angular routing works with IIS (SPA fallback)
- ✅ Easy deployment to IIS, Docker, or any hosting

## 🛠️ Build Process

### Windows (Batch Script)
```batch
cd C:\DEV\SSA-SDS_Analyzer
build-spa.bat
```

### Linux/Mac (Bash Script)
```bash
cd /path/to/SSA-SDS_Analyzer
chmod +x build-spa.sh
./build-spa.sh
```

**What the build does:**
1. Builds Angular frontend (`npm run build`)
2. Copies `dist/sds-frontend/browser/*` to `api/SSA.SDS.Api/wwwroot/`
3. Builds .NET API (`dotnet build -c Release`)

## 🌐 IIS Deployment

### Prerequisites:
- Windows Server with IIS
- .NET 8 Runtime
- ASP.NET Core Module for IIS

### Steps:

1. **Build & Publish:**
   ```batch
   build-spa.bat
   cd api\SSA.SDS.Api
   dotnet publish -c Release -o publish
   ```

2. **Deploy to IIS:**
   - Copy `publish` folder to `C:\inetpub\wwwroot\SSA-SDS\`
   - Create new IIS website pointing to that folder
   - Port: 80 (or desired)

3. **Set Permissions:**
   ```powershell
   icacls "C:\inetpub\wwwroot\SSA-SDS" /grant "IIS AppPool\DefaultAppPool":(OI)(CI)M /T
   ```

4. **Test:**
   - Browse to `http://your-server/`
   - Angular app loads, API calls to `/api/*` work

## 🐳 Docker Deployment

### Build Image:
```bash
docker build -t ssa-sds-spa:latest .
```

### Run Container:
```bash
docker run -d \
  --name ssa-sds \
  -p 8080:8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e ConnectionStrings__DefaultConnection="Server=sqlserver;Database=sds_db;User Id=sa;Password=YourPassword;Trust Server Certificate=true" \
  -v ssa-sds-uploads:/app/uploads \
  ssa-sds-spa:latest
```

## ⚙️ Configuration

### Environment Variables:
- `ASPNETCORE_ENVIRONMENT`: `Production`
- `ASPNETCORE_URLS`: `http://+:8080`
- `ConnectionStrings__DefaultConnection`: Your SQL Server connection string

## 🔧 Troubleshooting

**404 on Angular Routes:** Ensure `web.config` is in IIS root. `MapFallbackToFile("index.html")` handles SPA routing.

**API Calls Fail:** Check `environment.prod.ts` has `apiUrl: '/api'`. Rebuild frontend.

**500 on Startup:** Check database connection string and SQL Server accessibility.

**Static Files Not Loading:** Verify `wwwroot` exists and IIS permissions are correct.

## ✅ Deployment Checklist

- [ ] Build completed without errors
- [ ] `wwwroot` folder contains Angular files
- [ ] `web.config` is present
- [ ] Connection string is correct
- [ ] IIS app pool has correct permissions
- [ ] .NET 8 Runtime is installed
- [ ] ASP.NET Core Module is installed
- [ ] SQL Server is accessible
- [ ] Test locally before deploying

---
**Version:** 1.0 | **Last Updated:** 2026-07-09