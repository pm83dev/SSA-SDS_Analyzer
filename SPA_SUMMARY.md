# ✅ SPA Conversion Complete!

## 🎉 What Was Done

Your two separate applications (API + Frontend) have been successfully converted into a **single deployable SPA** that can be published to IIS as one site.

## 📁 Files Created/Modified

### New Files:
1. **`build-spa.bat`** - Windows build script
2. **`build-spa.sh`** - Linux/Mac build script
3. **`Dockerfile`** - Multi-stage Docker build (at root)
4. **`api/SSA.SDS.Api/web.config`** - IIS configuration
5. **`DEPLOYMENT.md`** - Complete deployment guide

### Modified Files:
1. **`api/SSA.SDS.Api/Program.cs`** - Now serves Angular frontend
2. **`frontend/sds-frontend/src/environments/environment.prod.ts`** - API URL set to `''` (relative)

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│  Browser                            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  IIS (Port 80)                      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  ASP.NET Core (Port 8080)           │
│  ┌────────────────────────────────┐ │
│  │ /api/* → API Controllers      │ │
│  │ /swagger/* → Swagger UI       │ │
│  │ /* → Angular Frontend         │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 🚀 How to Build

### Option 1: Using Build Script (Recommended)
```batch
cd C:\DEV\SSA-SDS_Analyzer
build-spa.bat
```

### Option 2: Manual Build
```batch
cd frontend\sds-frontend
npm install
npm run build -- --configuration production

cd ..\..\api\SSA.SDS.Api
mkdir wwwroot
xcopy /E /I /Y ..\..\frontend\sds-frontend\dist\sds-frontend\browser\* wwwroot\
dotnet build -c Release
```

## 📦 How to Deploy to IIS

### Step 1: Publish
```batch
cd api\SSA.SDS.Api
dotnet publish -c Release -o publish
```

### Step 2: Copy to IIS
- Copy entire `publish` folder to `C:\inetpub\wwwroot\SSA-SDS\`

### Step 3: Configure IIS
1. Open IIS Manager
2. Add New Website
3. Physical path: `C:\inetpub\wwwroot\SSA-SDS`
4. Port: `80`
5. Ensure "ASP.NET Core" is enabled

### Step 4: Set Permissions
```powershell
icacls "C:\inetpub\wwwroot\SSA-SDS" /grant "IIS AppPool\DefaultAppPool":(OI)(CI)M /T
```

### Step 5: Test
- Browse to `http://your-server/`
- Angular app should load
- Login and test API calls

## 🎯 Key Features

✅ **Single Port** - No CORS issues
✅ **Relative API Calls** - Frontend calls `/api/*` (same origin)
✅ **SPA Routing** - Angular routes work with IIS (fallback to index.html)
✅ **Easy Deployment** - One folder, one site
✅ **Docker Ready** - Multi-stage Dockerfile included
✅ **Production Ready** - Optimized Angular build

## 📝 Configuration

### Environment Variables (IIS or appsettings.json):
- `ASPNETCORE_ENVIRONMENT`: `Production`
- `ConnectionStrings__DefaultConnection`: Your SQL Server connection string

### Example appsettings.Production.json:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=sds_db;User Id=YOUR_USER;Password=YOUR_PASSWORD;Trust Server Certificate=true"
  }
}
```

## 🔧 Testing Locally

After building, you can test locally:
```batch
cd api\SSA.SDS.Api
dotnet run
```

Then browse to `http://localhost:5007` (or your configured port).

## 📚 Documentation

Full deployment guide: **`DEPLOYMENT.md`**

## ✅ Checklist Before Deployment

- [ ] Run `build-spa.bat` successfully
- [ ] Verify `wwwroot/index.html` exists
- [ ] Test locally with `dotnet run`
- [ ] Update connection string for production
- [ ] Copy `publish` folder to IIS
- [ ] Set IIS permissions
- [ ] Test in browser
- [ ] Check IIS logs if issues occur

## 🎓 Next Steps

1. **Test locally**: Run `dotnet run` in `api/SSA.SDS.Api`
2. **Deploy to IIS**: Follow the steps above
3. **Configure database**: Update connection string
4. **Monitor logs**: Check `logs/stdout` for errors

---
**Status**: ✅ Ready for deployment  
**Build Time**: ~2 minutes  
**Publish Size**: ~50 MB (including Angular + .NET dependencies)