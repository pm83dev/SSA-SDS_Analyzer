# Punti Aperti - Decisioni Prese

> **Stato: aggiornato al 2026-10-13** — riflette l'implementazione reale nel repository.
> Le decisioni originali sono mantenute dove ancora valide; le divergenze
> dall'implementazione sono segnalate con ⚠️.

## P1. Autenticazione e Autorizzazione ⚠️ COMPLETATO CON BUG

**Decisione:** JWT con username/password locale
- Ruoli: Admin, Operator
- Refresh Token: Sì
- Hash password: BCrypt.NET
- Token expiration: 2h Access Token, 7g Refresh Token

**Implementato:**
- Tabella `users` con username univoco
- Controller `AuthController` con login, refresh, register
- `AuthService` con generazione JWT
- SeedService per admin di default (admin/admin123)
- Tutti i controller protetti con `[Authorize]`
- Swagger con security scheme JWT Bearer

**⚠️ Divergenze / bug:**
- **Database:** SQL Server (non PostgreSQL come da decisione originale)
- **Refresh Token:** endpoint `POST /api/auth/refresh` presente ma **non valida
  il refresh token** — ritorna sempre un nuovo token per il primo utente attivo
  (bug da correggere)
- **Frontend:** nessuna pagina di login (token letto da localStorage,
  ma non c'è flusso di autenticazione UI)

## P2. Stile Frontend ✅ COMPLETATO

**Decisione:** Bootstrap 5 principalmente
- Bootstrap 5.3.3 installato via npm
- Popper.js 2.11.8 per dropdown/modals
- Configurato in `angular.json` (styles + scripts)
- Import Bootstrap JS in `main.ts`

**Implementato:**
- Angular 21.2 (standalone components, bootstrapApplication)
- Layout con navbar + lazy loading per feature
- CSS custom inline nei componenti (in aggiunta a Bootstrap)

## P3. Model LLM ⚠️ COMPLETATO CON INCOERENZA

**Decisione:** Qwen3.6-35B-A3B-UD-Q8_K_XL via URL server
- Embedding: BGE
- Reranking: BGE reranker v2-m3
- Accesso: API REST sul server

**Implementato:**
- LLM Service con endpoint `/api/llm/analyze`
- Configurazione in `docker-compose.yml` con URL server
- Prompt per analisi schede di sicurezza in JSON

**⚠️ Divergenze:**
- **`llm-service/main.py` contiene codice C#** (WebApplication .NET),
  non Python — il Dockerfile però è Python 3.11 con uvicorn
- **Estrazione testo PDF:** TODO nel codice (non implementata)
- **Embedding/Reranking:** configurati ma non usati

## P4. Prompt per Analisi LLM ✅ COMPLETATO

**Campi da estrarre:**
- Tipologia, Titolo, Numero Protocollo
- Ente Emittitore, Data Rilascio, Data Scadenza
- Validità Mesi, Stato, Frequenza Controllo, Osservazioni

**⚠️ Nota:** il prompt è definito ma l'analisi LLM non è ancora
funzionante (vedi P3 per le incoerenze del servizio).

## P5. Formato Import Excel ⏳ DA DEFINIRE

**Stato attuale:**
- UI presente (drag & drop, selezione file)
- Endpoint `POST /api/import/excel`: **stub** (logga e risponde "da implementare")
- Nessun parsing Excel, nessuna mappatura colonne, nessun report

**Da definire:**
- Formato colonne del file Excel
- Mappatura colonne → campi Client/SafetyCard
- Libreria di parsing (EPPlus, ClosedXML, o equivalente)
- Report import (successi/errori)

## P6. Storage File PDF ⚠️ COMPLETATO PARZIALMENTE

**Decisione:** File system locale
- Max 20MB per file
- Path: `uploads/pdf/{clientId}/{cardId}_{timestamp}.pdf`

**Implementato:**
- Configurazione `FileStorage` in `appsettings.json`

**⚠️ Divergenze:**
- **Upload PDF:** endpoint `POST /api/safety-cards/{id}/upload-pdf` **mancante**
- **Storage file:** non implementato (solo configurazione presente)

## P7. Notifiche Scadenze ⚠️ COMPLETATO PARZIALMENTE

**Decisione:** 90 giorni (warning), 30 giorni (alert), 0 giorni (scaduta)

**Implementato:**
- Tabella `notifications` presente
- UI dashboard con statistiche (client-side)
- Pagina scadenze con filtri 30/60/90/365 giorni (client-side)

**⚠️ Divergenze:**
- **Nessun endpoint** per notifiche (`GET /api/notifications`,
  `PUT /api/notifications/{id}/read` mancanti)
- **Nessun job di generazione** notifiche
- **Calcolo stato schede:** campo `Stato` presente ma **non calcolato
  automaticamente** (default "NotExpired", nessun BackgroundService)

## P8. Deployment Target ⚠️ COMPLETATO CON DIVERGENZE

**Decisione:** Docker Compose per Linux
- PostgreSQL 16
- API .NET 8
- Frontend Angular (nginx)
- LLM Service (FastAPI)

**Implementato:**
- `docker-compose.yml` con servizi: api, frontend, llm-service
- Frontend: nginx con proxy `/api/` → `api:8080`
- API: .NET 8, porta 5007:8080

**⚠️ Divergenze:**
- **Database:** SQL Server (non PostgreSQL come da decisione originale)
- **Nessun servizio DB nel compose** (si presume esterno)
- **Dockerfile API:** riferisce a progetti non esistenti (Domain/App/Infra)
- **LLM Service:** Dockerfile Python ma `main.py` contiene codice C#

## P9. Struttura Progetto API ⚠️ DIVERGENZA

**Decisione originale:** Split Domain/Application/Infrastructure

**Implementazione reale:**
- Progetto unico `SSA.SDS.Api` (no split)
- Tutti i componenti in un solo progetto (Controllers, Services, Data, Entities, DTOs)

**⚠️ Impatto:**
- Dockerfile API riferisce a progetti non esistenti
- Struttura più semplice ma meno modulare

## P10. Convenzioni Database ⚠️ DIVERGENZA

**Decisione originale:** PostgreSQL con naming snake_case

**Implementazione reale:**
- SQL Server con `Integrated Security=true` (autenticazione Windows)
- Naming snake_case mantenuto (tabelle: `clients`, `safety_cards`, ecc.)
- Trigger SQL per `updated_at`
- EF Core Migrations (InitialCreate presente)

**⚠️ Impatto:**
- Conn string diversa (SQL Server vs PostgreSQL)
- `db/init.sql` è uno script SQL Server (non PostgreSQL)

## P11. Testing ⏳ DA DEFINIRE

**Stato attuale:**
- Nessun test unitario o di integrazione presente
- Nessun framework di testing configurato

**Da definire:**
- Framework (xUnit, NUnit, o equivalente)
- Copertura minima
- Test per API (endpoint CRUD, auth)
- Test per frontend (componenti, servizi)

## P12. Documentazione ⏳ DA DEFINIRE

**Stato attuale:**
- `PROJECT_BLUEPRINT.md` aggiornato (riflette stato reale)
- `punti_aperti.md` (questo file)
- Swagger disponibile (con security scheme Bearer)

**Da definire:**
- README con istruzioni setup (API, frontend, DB)
- Documentazione API (endpoint, parametri, esempi)
- Documentazione deployment (Docker, variabili ambiente)

## P13. Prossimi Passi Consigliati

1. **Correggere incoerenze:**
   - `llm-service/main.py`: decidere se Python (FastAPI) o C# (.NET)
   - `Dockerfile` API: rimuovere riferimenti a progetti non esistenti
   - `SSA.SDS.Api.http`: aggiornare con endpoint reali (ancora weatherforecast)
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
7. **Testing:**
   - Setup framework di testing
   - Test unitari per servizi
   - Test di integrazione per API
8. **Documentazione:**
   - README con istruzioni setup
   - Documentazione API
   - Documentazione deployment
