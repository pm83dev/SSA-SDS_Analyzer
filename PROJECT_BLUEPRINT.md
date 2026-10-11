# PROJECT BLUEPRINT - SSA-SDS (Schede di Sicurezza Gestione)

## 1. Panoramica Progetto

**Nome:** SSA-SDS (Schede di Sicurezza Management & Desk)
**Tipo:** Single Page Application (SPA) con backend REST API
**Scopo:** Gestione clienti e relative schede di sicurezza, con import massivo da Excel e analisi intelligente di PDF tramite LLM locale.

---

## 2. Stack Tecnologico

### Frontend
- **Framework:** Angular 18+
- **Language:** TypeScript
- **Styling:** Bootstrap 5.3 (principalmente)
- **File Upload:** Custom drag & drop component
- **Excel Processing:** xlsx library (SheetJS) per parsing lato client
- **State Management:** Angular Signals / NgRx (da definire in base complessità)

### Backend (API)
- **Framework:** .NET 8 (ASP.NET Core Web API)
- **Language:** C#
- **ORM:** Entity Framework Core
- **Validation:** FluentValidation
- **AutoMapper:** per mapping DTO <-> Entity

### Database
- **Motor:** PostgreSQL 15+
- **Migrations:** EF Core Migrations
- **Seeding:** Script SQL / EF Core seeding

### LLM Service
- **Engine:** llama.cpp (server locale)
- **Protocol:** HTTP REST API (llama.cpp server)
- **Linguaggio:** Python (wrapper) o C# (HTTP client diretto)
- **Model:** Qwen3.6-35B-A3B-UD-Q8_K_XL (via URL server)
- **Embedding:** BGE
- **Reranking:** BGE reranker v2-m3

---

## 3. Architettura

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Angular SPA)                    │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────────┐  │
│  │ Gestione  │ │ Schede   │ │ Upload    │ │ Dashboard/       │  │
│  │ Clienti   │ │ Sicurezza│ │ Excel/PDF │ │ Scadenze         │  │
│  └──────────┘ └──────────┘ └───────────┘ └──────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST
┌────────────────────────▼────────────────────────────────────────┐
│                   .NET 8 API (ASP.NET Core)                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌─────────────┐  │
│  │ Clients    │ │ SafetyCards│ │ Import     │ │ Auth/       │  │
│  │ Controller │ │ Controller │ │ Controller │ │ Scenarios   │  │
│  └────────────┘ └────────────┘ └────────────┘ └─────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Services Layer (Business Logic)                         │   │
│  │  - ClientService / SafetyCardService / ImportService     │   │
│  │  - LLMAnalysisService / NotificationService              │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Data Access Layer                                       │   │
│  │  - EF Core DbContext                                     │   │
│  │  - Repositories (opzionale)                              │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
    ┌─────────▼─────────┐   ┌──────▼──────┐
    │   PostgreSQL      │   │  llama.cpp  │
    │   Database        │   │  (Locale)   │
    └───────────────────┘   └─────────────┘
```

---

## 4. Modelli Dati

### 4.1 Cliente

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| Id | int (PK) | Identificativo |
| RagioneSociale | string | Nome azienda/persona |
| CodiceFiscale | string? | CF/P.IVA |
| Indirizzo | string? | Indirizzo completo |
| Citta | string? | Città |
| Provincia | string? | Provincia |
| Cap | string? | CAP |
| Telefono | string? | Telefono |
| Email | string? | Email |
| Contatto | string? | Referente |
| Note | string? | Note generiche |
| CreatedAt | datetime | Data creazione |
| UpdatedAt | datetime | Data ultima modifica |

### 4.2 Scheda di Sicurezza

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| Id | int (PK) | Identificativo |
| ClientId | int (FK) | Cliente di riferimento |
| Tipologia | string | Tipo scheda (es. DPI, Rischi, Antincendio, ecc.) |
| Titolo | string | Titolo descrittivo |
| NumeroProtocollo | string? | Numero protocollo/identificativo |
| EnteEmettitore | string? | Ente che ha emesso la scheda |
| DataRilascio | date | Data rilascio |
| DataScadenza | date | Data scadenza |
| ValiditaMesi | int? | Validità in mesi (calcolo automatico scadenza) |
| Stato | enum | Valida/Scaduta/In Scadenza/Non Scaduta |
| FrequenzaControllo | string? | Frequenza di rinnovo/controllo |
| Osservazioni | string? | Note/osservazioni |
| PdfUrl | string? | Percorso file PDF allegato |
| LlmAnalyzed | bool | Se analizzata tramite LLM |
| LlmRawResponse | jsonb? | Risposta grezza LLM |
| CreatedAt | datetime | Data creazione |
| UpdatedAt | datetime | Data ultima modifica |

### 4.3 ImportHistory

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| Id | int (PK) | Identificativo |
| FileName | string | Nome file originale |
| FileType | enum | Excel/PDF |
| ClientId | int (FK)? | Cliente associato |
| RecordsImported | int | Record importati |
| Status | enum | Success/Error/Processing |
| ErrorMessage | string? | Errore in caso di fallimento |
| CreatedAt | datetime | Data import |

### 4.4 Notification

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| Id | int (PK) | Identificativo |
| ClientId | int (FK) | Cliente di riferimento |
| CardId | int (FK)? | Scheda di riferimento |
| Type | enum | ScadenzaProssima/Scaduta |
| Message | string | Messaggio notifica |
| IsRead | bool | Letta/non letta |
| SentDate | datetime | Data invio |
| CreatedAt | datetime | Data creazione |

---

## 5. Funzionalità

### 5.1 Gestione Clienti
- CRUD completo clienti
- Ricerca e filtraggio
- Import massivo da Excel
- Dettaglio cliente con elenco schede

### 5.2 Gestione Schede di Sicurezza
- CRUD schede di sicurezza
- Associazione a cliente
- Caricamento file PDF
- Analisi PDF tramite LLM (estrazione automatica campi)
- Visualizzazione stato scadenza (colori: verde=valida, giallo=in scadenza, rosso=scaduta)
- Calendario scadenze

### 5.3 Import Excel
- Upload file .xlsx/.xls
- Mappatura colonne Excel -> campi database
- Preview dati prima dell'import
- Validazione dati
- Report import (successi/errori)
- Gestione duplicati

### 5.4 Analisi LLM PDF
- Upload PDF scheda di sicurezza
- Invio a llama.cpp per analisi
- Estrazione automatica campi dalla scheda
- Preview dati estratti per conferma/modifica utente
- Salvataggio nel database
- Store risposta grezza per audit

### 5.5 Gestione Scadenze
- Dashboard con scadenze immini
- Notifiche per schede in scadenza (es. 30/60/90 giorni)
- Filtri per stato scadenza
- Report scadenze per cliente
- (Opzionale) Notifiche email

### 5.6 Autenticazione ✅ COMPLETATO
- JWT con username/password locale (DB PostgreSQL)
- Ruoli: Admin (accesso completo), Operatore (CRUD + import)
- Refresh Token per migliorare UX
- Password hash con BCrypt.NET
- Token expiration: 2h Access Token, 7g Refresh Token

---

## 6. API Endpoints

### Clients
| Method | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | /api/clients | Lista clienti (paginata) |
| GET | /api/clients/{id} | Dettaglio cliente |
| POST | /api/clients | Crea cliente |
| PUT | /api/clients/{id} | Aggiorna cliente |
| DELETE | /api/clients/{id} | Elimina cliente |
| GET | /api/clients/{id}/cards | Schede cliente |
| POST | /api/clients/import | Import Excel clienti |

### SafetyCards
| Method | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | /api/safety-cards | Lista schede (paginata, filtrabile) |
| GET | /api/safety-cards/{id} | Dettaglio scheda |
| POST | /api/safety-cards | Crea scheda |
| PUT | /api/safety-cards/{id} | Aggiorna scheda |
| DELETE | /api/safety-cards/{id} | Elimina scheda |
| POST | /api/safety-cards/{id}/upload-pdf | Carica PDF |
| DELETE | /api/safety-cards/{id}/pdf | Rimuovi PDF |
| POST | /api/safety-cards/analyze-pdf | Analisi LLM PDF |

### Import
| Method | Endpoint | Descrizione |
|--------|----------|-------------|
| POST | /api/import/excel | Importa file Excel |
| GET | /api/import/history | Storico import |
| GET | /api/import/{id}/status | Stato import |

### Scenarios/Notifications
| Method | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | /api/scenarios/expiring | Schede in scadenza |
| GET | /api/scenarios/expiring/{days} | Schede in scadenza entro X giorni |
| GET | /api/notifications | Lista notifiche |
| PUT | /api/notifications/{id}/read | Segna come letta |
| GET | /api/dashboard/stats | Stats dashboard |

---

## 7. Struttura Progetto

```
SSA-SDS/
├── api/                          # .NET 8 API
│   ├── src/
│   │   ├── SSA.SDS.Api/         # Progetto principale
│   │   ├── SSA.SDS.Domain/      # Entity / Domain models
│   │   ├── SSA.SDS.Application/ # Services / DTOs / Interfaces
│   │   └── SSA.SDS.Infrastructure/ # EF Core / External services
│   ├── tests/
│   │   ├── SSA.SDS.Domain.Tests/
│   │   ├── SSA.SDS.Application.Tests/
│   │   └── SSA.SDS.Api.Tests/
│   └── Dockerfile
│
├── frontend/                     # Angular SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/            # Services, Guards, Interceptors
│   │   │   ├── shared/          # Shared components, pipes, utils
│   │   │   ├── features/        # Feature modules
│   │   │   │   ├── clients/
│   │   │   │   ├── safety-cards/
│   │   │   │   ├── import/
│   │   │   │   ├── scenarios/
│   │   │   │   └── auth/
│   │   │   └── layout/          # Shell layout components
│   │   └── assets/
│   └── Dockerfile
│
├── llm-service/                  # Servizio analisi LLM
│   ├── llama_cpp_server/        # Wrapper/configurazione llama.cpp
│   ├── pdf_analyzer.py          # Analisi PDF e parsing
│   └── Dockerfile
│
├── db/                           # Database
│   ├── migrations/              # Script migration
│   ├── seed/                    # Dati di test
│   └── init.sql                 # Schema iniziale
│
├── docs/                         # Documentazione
│   └── ...
│
├── docker-compose.yml            # Orchestrazione servizi
├── docker-compose.dev.yml        # Profile dev
├── PROJECT_BLUEPRINT.md
└── punti_aperti.md
```

---

## 8. Tecnologie Dettaglio

### Backend .NET
- ASP.NET Core 8 Web API
- EF Core 8 con PostgreSQL provider (Npgsql)
- FluentValidation per validazione DTO
- AutoMapper per mapping
- Serilog per logging
- JWT Bearer Authentication
- MinIO / File System per storage PDF

### Frontend Angular
- Angular 18+ (Standalone Components)
- Bootstrap 5.3 per UI components
- RxJS per gestione asincrono
- Angular Router per routing
- Reactive Forms per form complessi
- Bootstrap tables per list
- Chart.js / ng2-charts per grafici dashboard

### LLM Service
- llama.cpp Python server
- PDF parsing: PyPDF2 o pdfplumber
- Python 3.11+
- Modello: Qwen3.6-35B-A3B-UD-Q8_K_XL (via API REST server)
- Embedding: BGE
- Reranking: BGE reranker v2-m3

---

## 9. Sicurezza

- Autenticazione JWT con Refresh Token
- CORS configurato solo per frontend
- Validazione input lato backend
- Sanitizzazione file upload (tipo, dimensione max)
- Password hashing con BCrypt
- HTTPS in produzione
- Audit log operazioni sensibili

---

## 10. Deployment

### Opzione 1: Docker Compose (Consigliata)
- Servizio API .NET
- Servizio Angular (build statiche)
- Servizio PostgreSQL
- Servizio LLM (llama.cpp)
- pgAdmin (opzionale, dev)

### Opzione 2: Deployment separato
- API: Windows Service / Linux systemd / Azure App Service
- Angular: IIS / Nginx / Apache
- PostgreSQL: Server dedicato / RDS
- llama.cpp: Server dedicato con GPU

---

## 11. Development Roadmap

### Fase 1 - Foundation
- [x] Blueprint progetto
- [x] Scaffold struttura
- [ ] Setup database e migration
- [ ] Implement entity e DbContext
- [ ] CRUD Clienti API
- [ ] CRUD Safety Cards API

### Fase 2 - Frontend Base
- [ ] Setup Angular
- [ ] Layout e navigazione
- [ ] Pagine CRUD Clienti
- [ ] Pagine CRUD Schede

### Fase 3 - Import & Upload
- [ ] Import Excel funzionalità
- [ ] Upload PDF
- [ ] Storage file

### Fase 4 - LLM Integration
- [ ] Setup llama.cpp
- [ ] Servizio analisi PDF
- [ ] Frontend analisi LLM
- [ ] Mapping risultati LLM

### Fase 5 - Scadenze & Dashboard
- [ ] Sistema notifiche scadenze
- [ ] Dashboard con statistiche
- [ ] Calcolo stato scadenze
- [ ] Filtri e report

### Fase 6 - Polish & Deployment
- [x] Autenticazione completa (JWT + BCrypt)
- [ ] Testing
- [ ] Documentazione
- [ ] Deployment

---

## 12. Convenzioni di Codice

### Backend
- Naming: PascalCase per classi/proprietà, camelCase per variabili
- DTO separati da Entity
- Repository pattern (opzionale, usare direttamente EF Core)
- Middleware per error handling globale
- API versioning (v1)

### Frontend
- Standalone components (Angular 17+ style)
- Injectable services
- Signal-based state management iniziale
- Component naming: camelCase con kebab-case in template
- Route-based lazy loading

### Database
- Tabella: snake_case, plurale (es. safety_cards)
- Colonne: snake_case
- Chiavi esterne: table_id (es. client_id)
- Indici su colonne di ricerca frequente
