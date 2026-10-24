# 🚀 Quick Start - Deploy to IIS

## 1. Build the SPA
```batch
cd C:\DEV\SSA-SDS_Analyzer
build-spa.bat
```

## 2. Publish
```batch
cd api\SSA.SDS.Api
dotnet publish -c Release -o publish
```

## 3. Deploy to IIS
```batch
# Copy to IIS (adjust path as needed)
xcopy /E /I /Y publish\* C:\inetpub\wwwroot\SSA-SDS\

# Set permissions
icacls "C:\inetpub\wwwroot\SSA-SDS" /grant "IIS AppPool\DefaultAppPool":(OI)(CI)M /T
```

## 4. Configure IIS
1. Open IIS Manager
2. Add New Website → Physical path: `C:\inetpub\wwwroot\SSA-SDS`
3. Port: 80
4. Ensure ASP.NET Core handler is enabled

## 5. Configure Database
Edit `C:\inetpub\wwwroot\SSA-SDS\appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=sds_db;User Id=YOUR_USER;Password=YOUR_PASSWORD;Trust Server Certificate=true"
  }
}
```

## 6. Test
Browse to: `http://your-server/`

---
**That's it!** Your SPA is now running as a single site on IIS. 🎉