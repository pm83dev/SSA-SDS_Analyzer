# Punti Aperti - Decisioni Prese

> **Stato: aggiornato al 2026-10-26** — riflette l'implementazione reale nel repository.
> Le decisioni originali sono mantenute dove ancora valide; le divergenze
> dall'implementazione sono segnalate con ⚠️.

## P1. Autenticazione e Autorizzazione ✅ COMPLETATO

**Decisione:** JWT con username/password locale
- Ruoli: Admin, Operator
- Refresh Token: Sì (validato, 7 giorni)
- Hash password: BCrypt.NET
- Token expiration: 2h Access Token, 7g Refresh Token

**Implementato:**
- Tabella `users` con username univoco, `RefreshToken`/`RefreshTokenExpires` in DB
- Controller `AuthController` con login, refresh, register
- `AuthService` con generazione JWT e **validazione refresh token**
- SeedService per admin di default (admin/admin123)
- Tutti i controller protetti con `[Authorize]`
- Swagger con security scheme JWT Bearer
- **Frontend:** pagina di login, `AuthService`, `authInterceptor` con refresh automatico, route guard

## P2. Stile Frontend ✅ COMPLETATO

**Decisione:** Bootstrap 5 principalmente
- Bootstrap 5.3.3 installato via npm
- Popper.js 2.11.8 per dropdown/modals
- Configurato in `angular.json` (styles + scripts)

**Implementato:**
- Angular 18.2 (standalone components, bootstrapApplication)
- TypeScript 5.5
- Layout con navbar (username + logout) + lazy loading per feature
- CSS custom inline nei componenti (in aggiunta a Bootstrap)

## P3. Model LLM ✅ COMPLETATO (tutto C#)

**Decisione:** Modello LLM via URL server (llama.cpp / OpenAI-compatible)

**Implementato:**
- **API** (`ImportService.CallLlmAsync`): estrae il testo PDF con **PdfPig** e chiama
  direttamente il server LLM (llama.cpp) su `/v1/chat/completions`
  (config `LLM:BaseUrl`, default `http://localhost:8080`)
- In Docker: `LLM__BaseUrl=http://host.docker.internal:8080`
- **OCR:** Tesseract OCR per PDF scansionati (PdfPageRenderer + PdfImageExtractor)
- **GhsPictogramMatcher:** riconoscimento pittogrammi GHS da immagini nel PDF
- **SdsVerifier:** verifica dati LLM contro testo SDS, campi non verificati segnati
- ⚠️ Embedding/Reranking: configurati ma non ancora usati

## P4. Prompt per Analisi LLM ✅ COMPLETATO

**Campi da estrarre (scheda di sicurezza):**
- Titolo, Produttore, Frasi H, Pittogrammi
- Composizione CAS (>0,1% e <0,1%), Composizione completa
- Stato fisico, Temperatura di ebollizione, COV %, Densità
- URL SDS, Data SDS
- Calcolo automatico: COV % (somma componenti), diisocianati, stato fisico

L'analisi crea/aggiorna l'entità `SafetyCard` collegata ai clienti.

## P5. Formato Import Excel ✅ COMPLETATO

**Implementato:**
- Libreria **ClosedXML** per il parsing .xlsx
- Mappatura colonne basata su `dati per SDS.xlsx` (ID CLIENTE, Nome prodotto chimico, Produttore, Frasi H, Pittogrammi, Composizione, Stato fisico, TEB, COV, Densità, URL SDS, Data SDS)
- `ImportService.ImportExcel`: crea/aggiorna clienti e schede di sicurezza
- **Report import**: numero record, errori con dettagli
- **Storico import**: tabella `import_history` + endpoint `GET /api/import/history`
- UI: drag & drop, selezione file, esito, storico

## P6. Storage File PDF ✅ COMPLETATO

**Decisione:** File system locale
- Max 20MB per file
- Path: `uploads/pdf/{clientId}/{cardId}_{timestamp}.pdf`

**Implementato:**
- `FileStorageService` (upload/download/delete)
- Endpoint `POST /api/safety-cards/{id}/upload-pdf`
- Endpoint `DELETE /api/safety-cards/{id}/pdf`
- Endpoint `GET /api/files/{...}` per il download
- UI: sezione PDF nel form scheda (carica/rimuovi), link nella lista
- SHA-256 del PDF (`PdfHash`) per evitare duplicati

## P7. Notifiche Scadenze ✅ COMPLETATO

**Decisione:** 90 giorni (warning), 30 giorni (alert), 0 giorni (scaduta)

**Implementato:**
- `ExpirationService`: ricalcola `Stato` e `DaysRemaining` delle schede, genera notifiche
- `ExpirationWorker`: **BackgroundService** che esegue il check orario
- Endpoint `GET /api/scenarios/expiring?days=N`
- Endpoint notifiche: `GET /api/notifications`, `GET /api/notifications/unread-count`,
  `PUT /api/notifications/{id}/read`, `PUT /api/notifications/read-all`, `DELETE /api/notifications/{id}`
- Endpoint `GET /api/dashboard/stats` (statistiche complete)
- UI: dashboard con stats + notifiche, pagina scadenze con filtri

## P8. Deployment Target ⚠️ COMPLETATO CON DIVERGENZE

**Implementato:**
- `docker-compose.yml` con servizi: api, frontend
- Frontend: nginx con proxy `/api/` → `api:8080`
- API: .NET 8, porta 5007:8080
- **Dockerfile API corretto** (progetto singolo, mkdir uploads/logs)
- **SPA:** frontend buildato in `wwwroot`, API serve tutto (raccomandato)
- Scripts: `build-spa.bat` (Windows), `build-spa.sh` (Linux/Mac)
- `web.config` per IIS

**⚠️ Divergenze:**
- **Database:** SQL Server (non PostgreSQL come da decisione originale)
- **Nessun servizio DB nel compose** (si presume esterno, `host.docker.internal`)

## P9. Struttura Progetto API ⚠️ DIVERGENZA

**Implementazione reale:**
- Progetto unico `SSA.SDS.Api` (no split Domain/App/Infra)
- Tutti i componenti in un solo progetto

## P10. Convenzioni Database ⚠️ DIVERGENZA

- SQL Server con `Integrated Security=true`
- Naming snake_case mantenuto
- EF Core Migrations: 7 migrazioni (InitialCreate → SchedeMoltiClienti)
- Relazione Client-SafetyCard: Many-to-Many via `client_safety_cards`
- ChemicalProduct merge in SafetyCard (entità eliminata)
- ⚠️ `db/init.sql` obsoleto: usare EF Core Migrations

## P11. Testing ⏳ DA DEFINIRE

Nessun test presente. Da definire framework (xUnit/NUnit) e copertura.

## P12. Documentazione ✅ AGGIORNATA

- `PROJECT_BLUEPRINT.md` aggiornato (2026-10-26)
- `DEPLOYMENT.md` presente
- `QUICKSTART.md` presente
- `SPA_SUMMARY.md` presente
- `frontend/sds-frontend/README.md` da aggiornare

## P13. Prossimi Passi Consigliati

1. **Testing**: setup framework + test unitari/integrazione
2. **Verifica end-to-end**: login → import Excel → upload PDF → analisi LLM → scadenze
3. **Documentazione**: README setup + documentazione API
4. **Embedding/Reranking**: valutare se attivarli (configurati ma non usati)
5. **Rate limiting**: implementare per API
6. **Audit log**: implementare per operazioni critiche
