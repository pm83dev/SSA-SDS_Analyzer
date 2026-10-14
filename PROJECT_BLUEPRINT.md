# PROJECT BLUEPRINT - SSA-SDS (Schede di Sicurezza Gestione)

> **Stato: aggiornato al 2026-10-13** — riflette l'implementazione reale nel repository
> (non più il piano iniziale). Le sezioni "Piano originale" sono state rimosse dove
> l'implementazione ha divergito; le divergenze sono segnalate esplicitamente.

## 1. Panoramica Progetto

**Nome:** SSA-SDS (Schede di Sicurezza Management & Desk)
**Tipo:** Single Page Application (Angular) + backend REST API (.NET 8)
**Scopo:** Gestione clienti e relative schede di sicurezza, con import massivo da Excel
e analisi intelligente di PDF tramite LLM locale.

**Stato attuale:** Fase 1-2 completate (CRUD API + frontend base funzionanti).
Fase 3-5 (import, LLM, scadenze) parzialmente implementate: UI presente ma backend
e servizio LLM ancora stub.

---

## 2. Stack Tecnologico (reale)

### Frontend
- **Framework:** Angular 21.2 (standalone components, bootstrapApplication)
- **Language:** TypeScript 5.9
- **Styling:** Bootstrap 5.3.3 + CSS custom inline nei componenti
- **State Management:** RxJS + servizi injectable (no Signals, no NgRx)
- **Build:** @angular/build (application builder), npm

### Backend (API)
- **Framework:** .NET 8 (ASP.NET Core Web API), SDK 8.0.420
- **ORM:** Entity Framework Core 8.0.13
- **Database:** **SQL Server** (provider Microsoft.EntityFrameworkCore.SqlServer)
  - ⚠️ Divergenza dal piano originale (PostgreSQL): l'implementazione usa SQL Server
    con `Integrated Security=true` (autenticazione Windows)
- **Auth:** JWT Bearer (Microsoft.AspNetCore.Authentication.JwtBearer 8.0.13) + BCrypt.Net-Next
- **Mapping:** AutoMapper 13.0.1 (registrato, ma i controller mappano manualmente)
- **Validation:** FluentValidation 11.9.2 (registrato, validator non ancora usati)
- **Logging:** Serilog 4.0.1 (Console + File sinks)
- **Swagger:** Swashbuckle 6.9.0 con security scheme Bearer

### LLM Service
- **Engine:** llama.cpp (server locale, esterno)
- **Model:** Qwen3.6-35B-A3B-UD-Q8_K_XL (via URL server)
- **Embedding:** BGE / **Reranking:** BGE reranker v2-m3 (configurati, non usati)
- **Implementazione:** ⚠️ `llm-service/main.py` contiene in realtà codice C#
  (WebApplication .NET), non Python — il Dockerfile però è Python 3.11 con uvicorn.
  Il servizio è uno stub: endpoint `/api/llm/analyze` presente, estrazione testo PDF
  da implementare (TODO nel codice).

### Database
- **Motor:** SQL Server (database `sds_db`)
- **Migrations:** EF Core Migrations (InitialCreate presente)
- **Seeding:** SeedService (admin di default) + `db/init.sql` (script SQL Server)

---

## 3. Architettura (reale)

```
┌─────────────────────────────────────────────────────────────────┐
│                    BROWSER (Angular 21 SPA)                     │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────────┐  │
│  │ Dashboard │ │ Clienti  │ │ Schede    │ │ Import /         │  │
│  │ (stats)   │ │ (CRUD)   │ │ (CRUD)    │ │ Scadenze (UI)    │  │
│  └──────────┘ └──────────┘ └───────────┘ └──────────────────┘  │
│  Navbar (layout) + lazy loading per route                       │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST (JWT Bearer)
┌────────────────────────▼────────────────────────────────────────┐
│              .NET 8 API (ASP.NET Core, porta 5007)              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌─────────────┐  │
│  │ Auth       │ │ Clients    │ │ SafetyCards│ │ Import /    │  │
│  │ Controller │ │ Controller │ │ Controller │ │ Scenarios   │  │
│  └────────────┘ └────────────┘ └────────────┘ └─────────────┘  │
│  Services: AuthService (JWT+BCrypt), SeedService (admin)       │
│  Data: SdsDbContext (EF Core, SQL Server)                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
             ┌───────────┴───────────┐
             │                       │
   ┌─────────▼─────────┐   ┌────────▼────────┐
   │   SQL Server      │   │  llama.cpp      │
   │   (sds_db)        │   │  (locale, stub) │
   └───────────────────┘   └─────────────────┘
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
| SafetyCards | ICollection<SafetyCard> | relazione 1:N |

### 4.2 SafetyCard (`safety_cards`)
| Campo | Tipo | Note |
|-------|------|------|
| Id | int (PK) | |
| ClientId | int (FK) | ON DELETE CASCADE |
| Tipologia | string | DPI / Antincendio / Rischi / Altro |
| Titolo | string | |
| NumeroProtocollo, EnteEmittitore | string? | |
| DataRilascio, DataScadenza | date? | |
| ValiditaMesi | int? | |
| Stato | string | default "NotExpired" (enum CardStatus: Valid/Expiring/Expired/NotExpired) |
| FrequenzaControllo, Osservazioni | string? | |
| PdfUrl | string? | |
| LlmAnalyzed | bool | |
| LlmRawResponse | string? | |
| CreatedAt / UpdatedAt | datetime | trigger SQL |

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
| CreatedAt / UpdatedAt | datetime | |

---

## 5. Funzionalità (stato reale)

### 5.1 Gestione Clienti ✅ COMPLETATO
- CRUD completo (API + frontend)
- Ricerca client-side (ragione sociale, città, email)
- Dettaglio cliente con elenco schede
- ⚠️ Import Excel clienti: **non implementato** (endpoint stub)

### 5.2 Gestione Schede di Sicurezza ✅ COMPLETATO
- CRUD completo (API + frontend)
- Associazione a cliente (select nel form)
- Filtri per tipologia e stato (client-side)
- Stato scadenza: campo `Stato` presente ma **non calcolato automaticamente**
  (default "NotExpired", nessun job di aggiornamento)
- ⚠️ Upload PDF: **non implementato** (endpoint mancante)
- ⚠️ Analisi LLM PDF: **non implementata** (endpoint mancante, servizio stub)

### 5.3 Import Excel ⏳ DA IMPLEMENTARE
- UI presente (drag & drop, selezione file)
- Endpoint `POST /api/import/excel`: **stub** (logga e risponde "da implementare")
- Nessun parsing Excel, nessuna mappatura colonne, nessun report

### 5.4 Analisi LLM PDF ⏳ DA IMPLEMENTARE
- UI presente (drag & drop PDF + selezione cliente)
- Endpoint `POST /api/safety-cards/analyze-pdf`: **mancante**
- LLM Service: stub con endpoint `/api/llm/analyze` (invio a llama.cpp)
- Estrazione testo PDF: **TODO** nel codice
- ⚠️ `main.py` contiene codice C#, non Python (incoerenza con Dockerfile)

### 5.5 Gestione Scadenze ⏳ PARZIALE
- UI presente (dashboard con stats, pagina scadenze con filtri 30/60/90/365 giorni)
- Calcolo giorni restanti: **client-side** (frontend)
- Endpoint `GET /api/scenarios`: **stub**
- Notifiche: tabella presente, **nessun endpoint, nessun job di generazione**

### 5.6 Autenticazione ✅ COMPLETATO
- JWT con username/password (DB SQL Server)
- Ruoli: Admin, Operator
- Refresh Token: endpoint presente ma **non valida il token** (ritorna sempre
  un nuovo token per il primo utente attivo — bug da correggere)
- Password hash: BCrypt.NET
- Token expiration: 2h Access Token
- Seed admin di default: `admin` / `admin123`
- ⚠️ **Nessuna pagina di login nel frontend** (token letto da localStorage,
  ma non c'è flusso di autenticazione UI)

---

## 6. API Endpoints (reale)

### Auth
| Method | Endpoint | Stato |
|--------|----------|-------|
| POST | /api/auth/login | ✅ |
| POST | /api/auth/refresh | ⚠️ (non valida refresh token) |
| POST | /api/auth/register | ✅ (solo Admin) |

### Clients
| Method | Endpoint | Stato |
|--------|----------|-------|
| GET | /api/clients | ✅ |
| GET | /api/clients/{id} | ✅ |
| POST | /api/clients | ✅ |
| PUT | /api/clients/{id} | ✅ |
| DELETE | /api/clients/{id} | ✅ |
| GET | /api/clients/{id}/cards | ❌ mancante (frontend lo chiama) |
| POST | /api/clients/import | ❌ mancante |

### SafetyCards
| Method | Endpoint | Stato |
|--------|----------|-------|
| GET | /api/safety-cards | ✅ |
| GET | /api/safety-cards/{id} | ✅ |
| POST | /api/safety-cards | ✅ |
| PUT | /api/safety-cards/{id} | ✅ |
| DELETE | /api/safety-cards/{id} | ✅ |
| POST | /api/safety-cards/{id}/upload-pdf | ❌ mancante |
| DELETE | /api/safety-cards/{id}/pdf | ❌ mancante |
| POST | /api/safety-cards/analyze-pdf | ❌ mancante |

### Import
| Method | Endpoint | Stato |
|--------|----------|-------|
| POST | /api/import/excel | ⚠️ stub |
| POST | /api/import/pdf | ⚠️ stub |
| GET | /api/import/history | ❌ mancante |
| GET | /api/import/{id}/status | ❌ mancante |

### Scenarios/Notifications
| Method | Endpoint | Stato |
|--------|----------|-------|
| GET | /api/scenarios | ⚠️ stub |
| GET | /api/scenarios/expiring | ❌ mancante |
| GET | /api/notifications | ❌ mancante |
| PUT | /api/notifications/{id}/read | ❌ mancante |
| GET | /api/dashboard/stats | ❌ mancante |

---

## 7. Struttura Progetto (reale)

```
SSA-SDS_Analyzer/
├── api/
│   ├── global.json                    # SDK 8.0.420
│   └── SSA.SDS.Api/                   # Progetto unico (no split Domain/App/Infra)
│       ├── Program.cs                 # Bootstrap: EF Core, JWT, CORS, Swagger, Seed
│       ├── Controllers/
│       │   ├── AuthController.cs      # login, refresh, register
│       │   ├── ClientsController.cs   # CRUD clienti
│       │   ├── SafetyCardsController.cs # CRUD schede
│       │   ├── ImportController.cs    # stub excel/pdf
│       │   └── ScenariosController.cs # stub
│       ├── Data/
│       │   └── SdsDbContext.cs        # DbContext + indici
│       ├── DTOs/
│       │   └── AuthDtos.cs            # Login/Register/Client/SafetyCard DTOs
│       ├── Entities/
│       │   ├── Client.cs
│       │   ├── SafetyCard.cs
│       │   ├── ImportHistory.cs
│       │   ├── Notification.cs
│       │   └── User.cs
│       ├── Enums/
│       │   └── CardStatus.cs          # CardStatus, ImportFileType, ImportStatus, NotificationType
│       ├── Migrations/
│       │   └── 20261013123420_InitialCreate.cs
│       ├── Services/
│       │   ├── AuthService.cs         # JWT + BCrypt
│       │   └── SeedService.cs         # admin di default
│       ├── appsettings.json           # conn string, JWT, LLM, FileStorage
│       ├── appsettings.Development.json
│       ├── Dockerfile                 # ⚠️ riferisce a progetti non esistenti
│       └── SSA.SDS.Api.http           # ⚠️ ancora weatherforecast (template)
│
├── frontend/
│   └── sds-frontend/
│       ├── src/
│       │   ├── main.ts                # bootstrapApplication
│       │   ├── index.html
│       │   ├── app/
│       │   │   ├── app.ts             # App root (navbar + router-outlet)
│       │   │   ├── app.html
│       │   │   ├── app.config.ts      # provideHttpClient, provideRouter
│       │   │   ├── app.routes.ts      # lazy loading per feature
│       │   │   ├── core/
│       │   │   │   ├── models/
│       │   │   │   │   ├── client.model.ts
│       │   │   │   │   └── safety-card.model.ts
│       │   │   │   └── services/
│       │   │   │       ├── api.service.ts         # base HTTP (no auth header)
│       │   │   │       ├── client.service.ts      # CRUD + auth header
│       │   │   │       └── safety-card.service.ts # CRUD + upload/analyze
│       │   │   ├── features/
│       │   │   │   ├── clients/
│       │   │   │   │   └── components/
│       │   │   │   │       ├── client-list.component.ts
│       │   │   │   │       ├── client-form.component.ts
│       │   │   │   │       └── client-detail.component.ts
│       │   │   │   ├── safety-cards/
│       │   │   │   │   └── components/
│       │   │   │   │       ├── card-list.component.ts
│       │   │   │   │       └── card-form.component.ts
│       │   │   │   ├── import/
│       │   │   │   │   └── components/
│       │   │   │   │       └── import.component.ts
│       │   │   │   └── scenarios/
│       │   │   │       └── components/
│       │   │   │           ├── dashboard.component.ts
│       │   │   │           └── scenarios.component.ts
│       │   │   └── layout/
│       │   │       └── components/
│       │   │           └── navbar.component.ts
│       │   └── environments/
│       │       ├── environment.ts     # apiUrl: http://localhost:5007
│       │       └── environment.prod.ts # apiUrl: '' (proxy nginx)
│       ├── angular.json               # Bootstrap in styles/scripts
│       ├── package.json               # Angular 21.2, Bootstrap 5.3.3
│       ├── Dockerfile                 # node:20-alpine → nginx:alpine
│       └── nginx.conf                 # proxy /api/ → api:8080
│
├── llm-service/
│   ├── main.py                        # ⚠️ contiene codice C#, non Python
│   ├── requirements.txt               # fastapi, uvicorn, pdfplumber, ecc.
│   └── Dockerfile                     # python:3.11-slim + uvicorn
│
├── db/
│   └── init.sql                       # Script SQL Server (tabelle + trigger)
│
├── docker-compose.yml                 # api, frontend, llm-service
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
- AutoMapper (registrato, non usato nei controller)
- FluentValidation (registrato, validator non ancora creati)
- Serilog (Console + File)
- Swagger con security scheme Bearer

### Frontend Angular
- Angular 21.2 (Standalone Components)
- Bootstrap 5.3.3 per UI
- RxJS per gestione asincrona
- Angular Router con lazy loading
- Reactive Forms per form
- CSS custom inline nei componenti (non solo Bootstrap)

### LLM Service
- ⚠️ Incoerenza: `main.py` contiene codice C# (WebApplication .NET)
  ma il Dockerfile è Python 3.11 con uvicorn
- requirements.txt: fastapi, uvicorn, pdfplumber, httpx
- Modello: Qwen3.6-35B-A3B-UD-Q8_K_XL (via API REST)
- Embedding: BGE / Reranking: BGE reranker v2-m3 (configurati, non usati)

---

## 9. Sicurezza (reale)

- Autenticazione JWT (Access Token 2h)
- CORS: solo `http://localhost:4200`
- Password hashing BCrypt
- ⚠️ **Nessuna pagina di login nel frontend** (token da localStorage,
  ma non c'è flusso UI)
- ⚠️ Refresh Token endpoint non valida il token (bug)
- ⚠️ Nessun rate limiting, nessun audit log

---

## 10. Deployment (reale)

### Docker Compose
- `api`: .NET 8, porta 5007:8080, conn string SQL Server
- `frontend`: nginx, porta 4200:80, proxy /api/ → api:8080
- `llm-service`: Python 3.11, porta 8000:8000
- ⚠️ Nessun servizio PostgreSQL/SQL Server nel compose (si presume esterno)
- ⚠️ Dockerfile API riferisce a progetti non esistenti (Domain/App/Infra)

### Sviluppo locale
- API: `dotnet run` (porta 5007)
- Frontend: `npm start` (porta 4200)
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
- [x] Setup Angular 21
- [x] Layout e navigazione (navbar + lazy loading)
- [x] Pagine CRUD Clienti (list, form, detail)
- [x] Pagine CRUD Schede (list, form)

### Fase 3 - Import & Upload ⏳ DA FARE
- [ ] Import Excel funzionalità (endpoint stub)
- [ ] Upload PDF (endpoint mancante)
- [ ] Storage file (config presente, non implementato)

### Fase 4 - LLM Integration ⏳ DA FARE
- [ ] Setup llama.cpp (esterno, configurato)
- [ ] Servizio analisi PDF (stub, estrazione testo TODO)
- [ ] Frontend analisi LLM (UI presente, endpoint mancante)
- [ ] Mapping risultati LLM (non implementato)

### Fase 5 - Scadenze & Dashboard ⏳ PARZIALE
- [x] Dashboard con statistiche (client-side)
- [x] Pagina scadenze con filtri (client-side)
- [ ] Sistema notifiche scadenze (tabella presente, nessun endpoint)
- [ ] Calcolo stato scadenze (campo presente, non aggiornato)
- [ ] Filtri e report server-side

### Fase 6 - Polish & Deployment ⏳ DA FARE
- [x] Autenticazione completa (JWT + BCrypt)
- [ ] Pagina di login nel frontend
- [ ] Fix refresh token (non valida il token)
- [ ] Testing
- [ ] Documentazione
- [ ] Deployment (Dockerfile API da correggere)

---

## 12. Convenzioni di Codice (reale)

### Backend
- Naming: PascalCase per classi/proprietà, camelCase per variabili
- DTO separati da Entity (in `DTOs/AuthDtos.cs`)
- Mapping manuale nei controller (AutoMapper registrato ma non usato)
- Controller con `[Authorize]` (tranne Auth)
- EF Core direttamente (no repository pattern)

### Frontend
- Standalone components (Angular 21)
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
- Trigger SQL per updated_at

---

## 13. Note e Divergenze dal Piano Originale

1. **Database:** SQL Server invece di PostgreSQL (divergenza significativa)
2. **Struttura API:** progetto unico invece di split Domain/Application/Infrastructure
3. **LLM Service:** `main.py` contiene codice C#, non Python (incoerenza)
4. **Autenticazione frontend:** nessuna pagina di login (token da localStorage)
5. **Refresh Token:** endpoint presente ma non valida il token (bug)
6. **Stato schede:** campo presente ma non calcolato automaticamente
7. **Dockerfile API:** riferisce a progetti non esistenti (Domain/App/Infra)
8. **SSA.SDS.Api.http:** ancora weatherforecast (template non aggiornato)

---

## 14. Prossimi Passi Consigliati

1. **Correggere incoerenze:**
   - `llm-service/main.py`: decidere se Python (FastAPI) o C# (.NET)
   - `Dockerfile` API: rimuovere riferimenti a progetti non esistenti
   - `SSA.SDS.Api.http`: aggiornare con endpoint reali
2. **Implementare import Excel:**
   - Parsing file .xlsx (libreria EPPlus o ClosedXML)
   - Mappatura colonne → campi
   - Report import (successi/errori)
3. **Implementare upload PDF:**
   - Endpoint `POST /api/safety-cards/{id}/upload-pdf`
   - Storage file (path configurato in appsettings)
4. **Implementare analisi LLM:**
   - Estrazione testo PDF (pdfplumber o equivalente .NET)
   - Invio a llama.cpp
   - Parsing risposta JSON
   - Creazione/aggiornamento scheda
5. **Implementare scadenze:**
   - Job di aggiornamento stato schede (BackgroundService)
   - Endpoint `/api/scenarios/expiring`
   - Generazione notifiche
6. **Frontend:**
   - Pagina di login (flusso autenticazione)
   - Interceptor HTTP per refresh token
   - Fix refresh token endpoint (validazione)
