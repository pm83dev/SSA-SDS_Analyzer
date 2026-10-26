# PROJECT BLUEPRINT - SSA-SDS (Schede di Sicurezza Gestione)

> **Stato: aggiornato al 2026-10-26** — riflette l'implementazione reale nel repository.
> Tutte le fasi principali sono completate; rimangono testing e documentazione finale.

## 1. Panoramica Progetto

**Nome:** SSA-SDS (Schede di Sicurezza Management & Desk)
**Tipo:** Single Page Application (Angular) + backend REST API (.NET 8)
**Scopo:** Gestione clienti e relative schede di sicurezza, con import massivo da Excel
e analisi intelligente di PDF tramite LLM locale, OCR per PDF scansionati e verifica
dei dati estratti contro il testo della SDS.

**Stato attuale:** Fase 1-6 completate:
- CRUD API + frontend funzionanti
- Autenticazione JWT completa (login, refresh token, route guard)
- Import Excel con report e storico
- Upload PDF + analisi LLM + OCR per PDF scansionati
- Verifica dei dati estratti (SdsVerifier)
- Riconoscimento pittogrammi GHS (GhsPictogramMatcher)
- Sistema scadenze con notifiche automatiche (BackgroundService)
- Dashboard con statistiche
- Deployment SPA su IIS/Docker

---

## 2. Stack Tecnologico (reale)

### Frontend
- **Framework:** Angular 18.2 (standalone components, bootstrapApplication)
- **Language:** TypeScript 5.5.4
- **Styling:** Bootstrap 5.3.3 + Popper.js 2.11.8 + CSS custom inline nei componenti
- **State Management:** RxJS + servizi injectable (no Signals, no NgRx)
- **Build:** @angular/build (application builder), npm 11.12.1
- **Testing:** Vitest (configurato, test da scrivere)

### Backend (API)
- **Framework:** .NET 8 (ASP.NET Core Web API)
- **ORM:** Entity Framework Core 8.0.13
- **Database:** **SQL Server** (provider Microsoft.EntityFrameworkCore.SqlServer)
  - ⚠️ Divergenza dal piano originale (PostgreSQL): l'implementazione usa SQL Server
    con `Integrated Security=true` (autenticazione Windows) o connettibilità TCP
- **Auth:** JWT Bearer (Microsoft.AspNetCore.Authentication.JwtBearer 8.0.13) + BCrypt.Net-Next 4.2.0
  - Access Token: 2h, Refresh Token: 7g (validato e memorizzato in DB)
- **Mapping:** AutoMapper 13.0.1 (registrato, i controller mappano manualmente)
- **Validation:** FluentValidation 11.9.2 (registrato, validator non ancora usati)
- **Logging:** Serilog 4.0.1 (Console + File rolling, 14 giorni di retention)
- **Swagger:** Swashbuckle 6.9.0 con security scheme Bearer, sotto `/api/swagger`
- **Excel:** ClosedXML 0.102.3 (import .xlsx)
- **PDF:** PdfPig 0.1.16 (estrazione testo), PdfSharpCore 1.3.67, SixLabors.ImageSharp 3.1.12
- **OCR:** TesseractOCR 5.5.2 (per PDF scansionati, lingue ita+eng)

### LLM
- **Engine:** Server LLM esterno (llama.cpp / OpenAI-compatible)
- **Model:** Configurabile (default: Qwen3.8-27B-UD-Q4_K_M.gguf)
- **Chiamata dall'API:** `ImportService.CallLlmAsync` chiama direttamente il server LLM
  su `/v1/chat/completions` (config `LLM:BaseUrl`)
- **Timeout:** Configurabile (default 300s)
- **Max testo:** Configurabile (default 60000 caratteri)
- ⚠️ Embedding/Reranking: configurati ma non ancora usati

### Database
- **Motor:** SQL Server (database `sds_db`)
- **Migrations:** EF Core Migrations (5 migrazioni: InitialCreate → SchedeMoltiClienti)
- **Seeding:** SeedService (admin di default: admin/admin123)
- ⚠️ `db/init.sql` è obsoleto: usare `dotnet ef database update`

---

## 3. Architettura (reale)

```
┌─────────────────────────────────────────────────────────────────┐
│                    BROWSER (Angular 18 SPA)                      │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────┐ │
│  │ Login    │ │Dashboard │ │ Clienti   │ │ Schede   │ │Import│ │
│  │          │ │(stats+   │ │ (CRUD)    │ │ (CRUD+   │ │Excel │ │
│  │          │ │ notifiche│ │           │ │ PDF+LLM) │ │/PDF  │ │
│  └──────────┘ └──────────┘ └───────────┘ └──────────┘ └──────┘ │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Scadenze (filtri) + Navbar (layout) + lazy loading        │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST (JWT Bearer, refresh automatico)
┌────────────────────────▼────────────────────────────────────────┐
│           .NET 8 API (ASP.NET Core, porta 5007 dev / 8080 prod)  │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ ┌───────────────┐   │
│  │ Auth     │ │ Clients  │ │ SafetyCards │ │ Import        │   │
│  │ Controller│ │Controller│ │ Controller  │ │ Controller    │   │
│  └──────────┘ └──────────┘ └─────────────┘ └───────────────┘   │
│  ┌───────────────┐ ┌──────────────┐ ┌───────────────┐          │
│  │ Scenarios     │ │ Notifications│ │ Dashboard     │          │
│  │ Controller    │ │ Controller   │ │ Controller    │          │
│  └───────────────┘ └──────────────┘ └───────────────┘          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Services:                                                  │  │
│  │  AuthService (JWT+BCrypt+RefreshToken)                     │  │
│  │  ImportService (Excel ClosedXML + PDF PdfPig + LLM)        │  │
│  │  OcrService (Tesseract per PDF scansionati)                │  │
│  │  SdsVerifier (verifica dati LLM contro testo SDS)          │  │
│  │  GhsPictogramMatcher (riconoscimento pittogrammi GHS)      │  │
│  │  ExpirationService + ExpirationWorker (BackgroundService)   │  │
│  │  FileStorageService (upload/download/delete PDF)           │  │
│  │  SeedService (admin default)                               │  │
│  └───────────────────────────────────────────────────────────┘  │
│  Data: SdsDbContext (EF Core, SQL Server)                       │
│  Static: Angular frontend in wwwroot (SPA fallback)             │
└────────────────────────┬────────────────────────────────────────┘
                         │
              ┌──────────┴──────────────────────────┐
              │                                     │
    ┌─────────▼─────────┐              ┌────────────▼───────────┐
    │   SQL Server      │              │  Server LLM esterno     │
    │   (sds_db)        │              │  (llama.cpp/OpenAI)     │
    │                   │              │                         │
    └───────────────────┘              └────────────────────────┘
```

---
## 4. Modelli Dati (reale)

### 4.1 Client (`clients`)
| Campo | Tipo | Note |
|-------|------|------|
| Id | int (PK) | Identity |
| RagioneSociale | string (NOT NULL) | `ragione_sociale` |
| CodiceFiscale | string? | univoco (indice) |
| Indirizzo, Citta, Provincia, Cap, Telefono, Email, Contatto, Note | string? | |
| CreatedAt / UpdatedAt | datetime | trigger SQL per updated_at |
| SafetyCards | ICollection<SafetyCard> | relazione M:N (tabella client_safety_cards) |

### 4.2 SafetyCard (`safety_cards`)
| Campo | Tipo | Note |
|-------|------|------|
| Id | int (PK) | |
| Tipologia | string (NOT NULL) | DPI / Antincendio / Rischi / Altro / SDS |
| Titolo | string (NOT NULL) | |
| NumeroProtocollo, EnteEmittitore | string? | EnteEmittitore = produttore della SDS |
| DataRilascio, DataScadenza | date? | |
| ValiditaMesi | int? | |
| Stato | string | default "NotExpired" (enum CardStatus: Valid/Expiring/Expired/NotExpired) |
| DaysRemaining | int? | giorni restanti alla scadenza (calcolato da ExpirationService) |
| FrequenzaControllo, Osservazioni | string? | |
| FrasiH | string? | codici frasi H (es. H225, H315) |
| Pittogrammi | string? | codici pittogrammi GHS (es. GHS02) |
| ComposizioneCasSopra | string? | componenti con CAS e % > 0,1% |
| ComposizioneCasSotto | string? | componenti con CAS e % < 0,1% |
| Composizione | string? | composizione completa |
| ContieneDiisocianati | bool? | rilevato automaticamente dalla composizione |
| StatoFisico | string? | |
| TemperaturaEbollizione | string? | |
| CovPercent | string? | percentuale COV/VOC |
| Densita | string? | |
| SdsUrl | string? | URL della SDS |
| PdfUrl | string? | percorso del PDF caricato |
| NomeFileImportato | string? | nome originale del file importato (PDF o Excel) |
| CampiDaVerificare | string? | campi non verificati nel testo SDS (nomi separati da virgola) |
| NoteVerifica | string? | motivo per ogni campo da verificare (una riga per campo) |
| LlmAnalyzed | bool | |
| LlmRawResponse | string? | risposta JSON grezza dell'LLM |
| PdfHash | string? | SHA-256 del PDF (per evitare duplicati) |
| CreatedAt / UpdatedAt | datetime | |
| Clients | ICollection<Client> | relazione M:N |

### 4.3 ImportHistory (`import_histories`)
| Campo | Tipo | Note |
|-------|------|------|
| Id | int (PK) | |
| FileName, FileType | string | |
| ClientId | int? (FK) | ON DELETE SET NULL |
| RecordsImported | int | |
| Status | string | Processing/Success/Error |
| ErrorMessage | string? | |
| CreatedAt | datetime | |

### 4.4 Notification (`notifications`)
| Campo | Tipo | Note |
|-------|------|------|
| Id | int (PK) | |
| ClientId | int (FK) | ON DELETE CASCADE |
| CardId | int? (FK) | ON DELETE SET NULL |
| Type | string | ExpiringSoon/Expired |
| Message | string | |
| IsRead | bool | |
| SentDate | date? | |
| CreatedAt | datetime | |

### 4.5 User (`users`)
| Campo | Tipo | Note |
|-------|------|------|
| Id | int (PK) | |
| Username | string | univoco |
| PasswordHash | string | BCrypt |
| Email | string? | |
| Role | string | Admin / Operator |
| IsActive | bool | |
| LastLogin | date? | |
| RefreshToken | string? | token di refresh (valido 7 giorni) |
| RefreshTokenExpires | date? | scadenza del refresh token |
| CreatedAt / UpdatedAt | datetime | |

---

## 5. Funzionalità (stato reale)

### 5.1 Gestione Clienti ✅ COMPLETATO
- CRUD completo (API + frontend)
- Ricerca client-side (ragione sociale, città, email)
- Dettaglio cliente con elenco schede
- Import Excel: crea/aggiorna clienti automaticamente

### 5.2 Gestione Schede di Sicurezza ✅ COMPLETATO
- CRUD completo (API + frontend)
- Associazione a più clienti (relazione M:N)
- Filtri per tipologia, stato, cliente (client-side)
- Stato scadenza: calcolato automaticamente da `ExpirationService`
- Upload PDF: `POST /api/safety-cards/{id}/upload-pdf` (max 20MB)
- Rimozione PDF: `DELETE /api/safety-cards/{id}/pdf`
- Download PDF: `GET /api/files/{...}`
- Analisi LLM PDF: `POST /api/safety-cards/analyze-pdf` (estrazione testo + LLM + verifica)
- Campi da verificare: evidenziati nel form con motivi

### 5.3 Import Excel ✅ COMPLETATO
- UI: drag & drop, selezione file, esito, storico
- Endpoint `POST /api/import/excel` (max 50MB)
- Parsing con ClosedXML, mappatura colonne basata su header
- Crea/aggiorna clienti e schede di sicurezza
- Report import: numero record importati, errori con dettagli
- Storico import: `GET /api/import/history`, `GET /api/import/{id}/status`

### 5.4 Analisi LLM PDF ✅ COMPLETATO
- Estrazione testo PDF con PdfPig (testo nativo) o OCR Tesseract (PDF scansionati)
- Riconoscimento pittogrammi GHS da immagini nel PDF (GhsPictogramMatcher)
- Chiamata al server LLM (llama.cpp/OpenAI-compatible) per estrarre dati strutturati
- Verifica dei dati estratti contro il testo della SDS (SdsVerifier)
- Campi non verificati segnati con `CampiDaVerificare` e `NoteVerifica`
- Evita duplicati: SHA-256 del PDF (`PdfHash`)
- Calcolo automatico: COV %, diisocianati, stato fisico

### 5.5 Gestione Scadenze ✅ COMPLETATO
- UI: dashboard con stats, pagina scadenze con filtri 30/60/90/365 giorni
- `ExpirationService`: ricalcola `Stato` e `DaysRemaining` delle schede
- `ExpirationWorker`: BackgroundService che esegue il check orario
- Endpoint `GET /api/scenarios/expiring?days=N`
- Endpoint `GET /api/scenarios` (tutte le schede con scadenza)
- Notifiche automatiche: generate da `ExpirationService`
- Endpoint notifiche: `GET /api/notifications`, `GET /api/notifications/unread-count`,
  `PUT /api/notifications/{id}/read`, `PUT /api/notifications/read-all`, `DELETE /api/notifications/{id}`
- Endpoint dashboard: `GET /api/dashboard/stats`

### 5.6 Autenticazione ✅ COMPLETATO
- JWT con username/password (DB SQL Server)
- Ruoli: Admin, Operator
- Refresh Token: validato, memorizzato in DB (7 giorni)
- Password hash: BCrypt.NET
- Token expiration: 2h Access Token, 7g Refresh Token
- Seed admin di default: `admin` / `admin123`
- Frontend: pagina di login, `AuthService`, `authInterceptor` con refresh automatico, route guard

---

## 6. API Endpoints (reale)

### Auth
| Method | Endpoint | Stato |
|--------|----------|-------|
| POST | /api/auth/login | ✅ |
| POST | /api/auth/refresh | ✅ (valida refresh token) |
| POST | /api/auth/register | ✅ (solo Admin) |

### Clients
| Method | Endpoint | Stato |
|--------|----------|-------|
| GET | /api/clients | ✅ |
| GET | /api/clients/{id} | ✅ |
| POST | /api/clients | ✅ |
| PUT | /api/clients/{id} | ✅ |
| DELETE | /api/clients/{id} | ✅ |

### SafetyCards
| Method | Endpoint | Stato |
|--------|----------|-------|
| GET | /api/safety-cards | ✅ |
| GET | /api/safety-cards/{id} | ✅ |
| POST | /api/safety-cards | ✅ |
| PUT | /api/safety-cards/{id} | ✅ |
| DELETE | /api/safety-cards/{id} | ✅ |
| POST | /api/safety-cards/{id}/upload-pdf | ✅ |
| DELETE | /api/safety-cards/{id}/pdf | ✅ |
| POST | /api/safety-cards/analyze-pdf | ✅ |

### Files
| Method | Endpoint | Stato |
|--------|----------|-------|
| GET | /api/files/{path} | ✅ (download PDF) |

### Import
| Method | Endpoint | Stato |
|--------|----------|-------|
| POST | /api/import/excel | ✅ |
| GET | /api/import/history | ✅ |
| GET | /api/import/{id}/status | ✅ |

### Scenarios/Notifications/Dashboard
| Method | Endpoint | Stato |
|--------|----------|-------|
| GET | /api/scenarios | ✅ |
| GET | /api/scenarios/expiring?days=N | ✅ |
| GET | /api/notifications | ✅ |
| GET | /api/notifications/unread-count | ✅ |
| PUT | /api/notifications/{id}/read | ✅ |
| PUT | /api/notifications/read-all | ✅ |
| DELETE | /api/notifications/{id} | ✅ |
| GET | /api/dashboard/stats | ✅ |

---

## 7. Struttura Progetto (reale)

```
SSA-SDS_Analyzer/
├── api/
│   ├── global.json                    # SDK 8.0.x
│   └── SSA.SDS.Api/                   # Progetto unico (no split Domain/App/Infra)
│       ├── Program.cs                 # Bootstrap: EF Core, JWT, CORS, Swagger, Serilog, Seed
│       ├── Controllers/
│       │   ├── AuthController.cs      # login, refresh, register
│       │   ├── ClientsController.cs   # CRUD clienti
│       │   ├── SafetyCardsController.cs # CRUD schede + upload/analyze PDF
│       │   ├── ImportController.cs    # import Excel + storico
│       │   ├── FilesController.cs     # download file
│       │   └── ScenariosController.cs # scadenze + notifiche + dashboard
│       ├── Data/
│       │   └── SdsDbContext.cs        # DbContext + indici + relazione M:N
│       ├── DTOs/
│       │   ├── AuthDtos.cs            # Login/Register/Token DTOs
│       │   ├── DashboardDtos.cs       # DashboardStatsDto
│       │   ├── ImportDtos.cs          # ImportExcelResultDto, ImportHistoryDto
│       │   └── ImportSafetyCardDto.cs # CreateSafetyCardDto, SafetyCardDto, ExpiringCardDto
│       ├── Entities/
│       │   ├── Client.cs
│       │   ├── SafetyCard.cs          # include campi SDS + verifica
│       │   ├── ImportHistory.cs
│       │   ├── Notification.cs
│       │   └── User.cs                # include RefreshToken
│       ├── Enums/
│       │   └── CardStatus.cs          # CardStatus, ImportFileType, ImportStatus, NotificationType
│       ├── Migrations/                # 7 migrazioni EF Core
│       ├── Services/
│       │   ├── AuthService.cs         # JWT + BCrypt + RefreshToken
│       │   ├── ImportService.cs       # Excel (ClosedXML) + PDF (PdfPig) + LLM
│       │   ├── OcrService.cs          # Tesseract OCR per PDF scansionati
│       │   ├── PdfImageExtractor.cs   # Estrae immagini da PDF
│       │   ├── PdfPageRenderer.cs     # Renderizza pagine PDF in immagini
│       │   ├── GhsPictogramMatcher.cs # Riconoscimento pittogrammi GHS
│       │   ├── SdsVerifier.cs         # Verifica dati LLM contro testo SDS
│       │   ├── FrasiH.cs              # Database frasi H (codice → descrizione)
│       │   ├── ExpirationService.cs   # Calcolo stato scadenze + notifiche
│       │   ├── ExpirationWorker.cs    # BackgroundService (check orario)
│       │   ├── FileStorageService.cs  # Upload/download/delete PDF
│       │   └── SeedService.cs         # admin di default
│       ├── tessdata/                  # File lingua Tesseract (ita, eng)
│       ├── uploads/                   # PDF caricati
│       ├── wwwroot/                   # Angular frontend (build) + ghs/ (pittogrammi)
│       ├── logs/                      # Log Serilog (rolling)
│       ├── appsettings.json           # conn string, JWT, LLM, FileStorage, Ocr
│       ├── Dockerfile                 # .NET 8 SDK → ASP.NET
│       ├── web.config                 # IIS configuration
│       └── SSA.SDS.Api.http           # File test API
│
├── frontend/
│   └── sds-frontend/
│       ├── src/
│       │   ├── main.ts                # bootstrapApplication
│       │   ├── index.html
│       │   ├── app/
│       │   │   ├── app.ts             # App root
│       │   │   ├── app.config.ts      # provideHttpClient, provideRouter, interceptors
│       │   │   ├── app.routes.ts      # lazy loading + auth guard
│       │   │   ├── core/
│       │   │   │   ├── guards/        # auth guard
│       │   │   │   ├── interceptors/  # auth.interceptor.ts (JWT + refresh)
│       │   │   │   ├── models/        # client, safety-card, frasi-h, sds-fields
│       │   │   │   └── services/      # api, auth, client, safety-card, import,
│       │   │   │                       # notification, scenario
│       │   │   ├── features/
│       │   │   │   ├── auth/          # login.component
│       │   │   │   ├── clients/       # client-list, client-form, client-detail
│       │   │   │   ├── safety-cards/  # card-list, card-form
│       │   │   │   ├── import/        # import.component
│       │   │   │   └── scenarios/     # dashboard, scenarios
│       │   │   ├── layout/            # navbar.component
│       │   │   └── shared/            # sds-value.component
│       │   └── environments/
│       │       ├── environment.ts     # apiUrl: '' (proxy ng serve)
│       │       └── environment.prod.ts # apiUrl: '' (stessa origine)
│       ├── public/ghs/                # Immagini pittogrammi GHS01-GHS09
│       ├── angular.json               # Bootstrap in styles/scripts
│       ├── package.json               # Angular 18.2, Bootstrap 5.3.3
│       ├── proxy.conf.json            # Proxy dev /api → localhost:5007
│       ├── Dockerfile                 # node:20-alpine → nginx:alpine
│       └── nginx.conf                 # proxy /api/ → api:8080
│
├── db/
│   └── init.sql                       # ⚠️ OBSOLETO: usare EF Core Migrations
│
├── docker-compose.yml                 # api, frontend
├── Dockerfile                         # Multi-stage: Angular + .NET API (SPA)
├── build-spa.bat                      # Build script Windows
├── build-spa.sh                       # Build script Linux/Mac
├── DEPLOYMENT.md                      # Guida deployment
├── QUICKSTART.md                      # Quick start IIS
├── SPA_SUMMARY.md                     # Riepilogo conversione SPA
├── PROJECT_BLUEPRINT.md               # Questo file
└── punti_aperti.md                    # Decisioni prese
```

---

## 8. Tecnologie Dettaglio (reale)

### Backend .NET
- ASP.NET Core 8 Web API
- EF Core 8 con SQL Server provider
- JWT Bearer Authentication
- BCrypt.NET per hash password
- Serilog (Console + File rolling)
- Swagger con security scheme Bearer
- ClosedXML per import Excel
- PdfPig per estrazione testo PDF
- Tesseract OCR per PDF scansionati
- GhsPictogramMatcher per riconoscimento pittogrammi GHS

### Frontend Angular
- Angular 18.2 (Standalone Components)
- TypeScript 5.5
- Bootstrap 5.3.3 per UI
- RxJS per gestione asincrona
- Angular Router con lazy loading + auth guard
- Reactive Forms per form
- HttpInterceptor per JWT + refresh token automatico

### LLM Service
- ASP.NET Core .NET 8 (porta 8000)
- Chiamata HTTP al server LLM (llama.cpp / OpenAI-compatible)
- Endpoint: POST /analyze
- Prompt engineering per estrarre dati strutturati dalla SDS
- Timeout configurabile (default 180s)

### OCR
- Tesseract OCR (lingue: ita, eng)
- File tessdata inclusi nel progetto
- Usato per PDF scansionati (senza layer di testo)

---

## 9. Sicurezza (reale)

- Autenticazione JWT (Access Token 2h, Refresh Token 7 giorni)
- Refresh Token validato e memorizzato in DB
- CORS: `http://localhost:4200` (dev), stessa origine (prod)
- Password hashing BCrypt
- Pagina di login nel frontend con `AuthService`
- `authInterceptor`: aggiorna token automaticamente su 401
- Route guard: redirect a login se non autenticato
- ⚠️ Nessun rate limiting, nessun audit log

---

## 10. Deployment (reale)

### SPA (raccomandato)
- Frontend Angular buildato in `api/SSA.SDS.Api/wwwroot`
- API serve frontend + API sulla stessa porta
- Scripts: `build-spa.bat` (Windows), `build-spa.sh` (Linux/Mac)
- Docker: `Dockerfile` multi-stage (Node + .NET)
- IIS: `web.config` incluso nel progetto API

### Docker Compose
- `api`: .NET 8, porta 5007:8080, SQL Server esterno
- `frontend`: nginx, porta 4200:80, proxy /api/ → api:8080
- Nessun servizio DB nel compose (si presume esterno)

### Sviluppo locale
- API: `dotnet run` (porta 5007)
- Frontend: `npm start` (porta 4200, proxy /api → 5007)
- DB: SQL Server locale (Integrated Security)

---

## 11. Development Roadmap (stato reale)

### Fase 1 - Foundation ✅ COMPLETATA
- [x] Blueprint progetto
- [x] Scaffold struttura
- [x] Setup database e migration (SQL Server, EF Core)
- [x] Implement entity e DbContext
- [x] CRUD Clienti API
- [x] CRUD Safety Cards API

### Fase 2 - Frontend Base ✅ COMPLETATA
- [x] Setup Angular 18
- [x] Layout e navigazione (navbar + lazy loading)
- [x] Pagine CRUD Clienti (list, form, detail)
- [x] Pagine CRUD Schede (list, form)

### Fase 3 - Import & Upload ✅ COMPLETATA
- [x] Import Excel funzionalità (ClosedXML)
- [x] Upload PDF (PdfPig + storage)
- [x] Storage file (FileStorageService)

### Fase 4 - LLM Integration ✅ COMPLETATA
- [x] Setup LLM service (.NET 8)
- [x] Servizio analisi PDF (estrazione testo + OCR + LLM)
- [x] Frontend analisi LLM
- [x] Mapping risultati LLM + verifica (SdsVerifier)
- [x] Riconoscimento pittogrammi GHS
- [x] Calcolo automatico COV/diisocianati

### Fase 5 - Scadenze & Dashboard ✅ COMPLETATA
- [x] Dashboard con statistiche
- [x] Pagina scadenze con filtri
- [x] Sistema notifiche scadenze (ExpirationService)
- [x] Calcolo stato scadenze (ExpirationWorker)
- [x] Endpoint server-side per scadenze/notifiche

### Fase 6 - Polish & Deployment ✅ COMPLETATA
- [x] Autenticazione completa (JWT + BCrypt + Refresh Token)
- [x] Pagina di login nel frontend
- [x] Refresh token valido (validato in DB)
- [ ] Testing (unit test non implementati)
- [x] Documentazione (aggiornata)
- [x] Deployment (SPA + Docker)

---

## 12. Convenzioni di Codice (reale)

### Backend
- Naming: PascalCase per classi/proprietà, camelCase per variabili
- DTO separati da Entity (in `DTOs/`)
- Mapping manuale nei controller
- Controller con `[Authorize]` (tranne Auth)
- EF Core direttamente (no repository pattern)

### Frontend
- Standalone components (Angular 18)
- Injectable services (providedIn: 'root')
- RxJS per gestione asincrona
- Component naming: camelCase con kebab-case in template
- Route-based lazy loading
- CSS custom inline nei componenti

### Database
- Tabella: snake_case, plurale (es. safety_cards)
- Colonne: snake_case
- Chiavi esterne: table_id (es. client_id)
- Indici su colonne di ricerca frequente
- Migrations EF Core (no trigger SQL)

---

## 13. Note e Divergenze dal Piano Originale

1. **Database:** SQL Server invece di PostgreSQL (decisione presa)
2. **Struttura API:** progetto unico invece di split Domain/Application/Infrastructure
3. **LLM:** chiamato direttamente dall'API (no servizio separato)
4. **OCR:** Tesseract OCR per PDF scansionati
5. **ChemicalProduct:** merge in SafetyCard (entità eliminata)
6. **Relazione Client-SafetyCard:** Many-to-Many (inizialmente One-to-Many)
7. **SPA:** frontend buildato in wwwroot, API serve tutto
8. **db/init.sql:** obsoleto, usare EF Core Migrations

---

## 14. Prossimi Passi Consigliati

1. **Testing:**
   - Unit test per servizi (ImportService, OcrService, SdsVerifier)
   - Integration test per API endpoints
   - End-to-end test per flussi completi
2. **Sicurezza:**
   - Rate limiting per API
   - Audit log per operazioni critiche
3. **Performance:**
   - Cache per dati LLM
   - Ottimizzazione query database
4. **Documentazione API:**
   - Swagger aggiornato con esempi
   - Documentazione endpoint LLM
