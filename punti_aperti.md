# Punti Aperti - Decisioni Prese

## P1. Autenticazione e Autorizzazione ✅ COMPLETATO

**Decisione:** JWT con username/password locale (DB PostgreSQL)
- Ruoli: Admin, Operator
- Refresh Token: Sì
- Hash password: BCrypt.NET
- Token expiration: 2h Access Token, 7g Refresh Token

**Implementato:**
- Tabella `Users` con username univoco
- Controller `AuthController` con login, refresh, register
- `AuthService` con generazione JWT
- SeedService per admin di default (admin/admin123)
- Tutti i controller protetti con `[Authorize]`
- Swagger con security scheme JWT Bearer

## P2. Stile Frontend ✅ COMPLETATO

**Decisione:** Bootstrap 5 principalmente
- Bootstrap 5.3.3 installato via npm
- Popper.js 2.11.8 per dropdown/modals
- Configurato in `angular.json` (styles + scripts)
- Import Bootstrap JS in `main.ts`

## P3. Model LLM ✅ COMPLETATO

**Decisione:** Qwen3.6-35B-A3B-UD-Q8_K_XL via URL server
- Embedding: BGE
- Reranking: BGE reranker v2-m3
- Accesso: API REST sul server

**Implementato:**
- LLM Service FastAPI con endpoint `/api/llm/analyze`
- Configurazione in `docker-compose.yml` con URL server
- Prompt per analisi schede di sicurezza in JSON

## P4. Prompt per Analisi LLM ✅ COMPLETATO

**Campi da estrarre:**
- Tipologia, Titolo, Numero Protocollo
- Ente Emittitore, Data Rilascio, Data Scadenza
- Validità Mesi, Stato, Frequenza Controllo, Osservazioni

## P5. Formato Import Excel ⏳ DA DEFINIRE

## P6. Storage File PDF ✅ COMPLETATO

**Decisione:** File system locale
- Max 20MB per file
- Path: `uploads/pdf/{clientId}/{cardId}_{timestamp}.pdf`

## P7. Notifiche Scadenze ✅ COMPLETATO

**Decisione:** 90 giorni (warning), 30 giorni (alert), 0 giorni (scaduta)

## P8. Deployment Target ✅ COMPLETATO

**Decisione:** Docker Compose per Linux
- PostgreSQL 16
- API .NET 8
- Frontend Angular (nginx)
- LLM Service (FastAPI)

## P9-P12. Altri punti ⏳ DA DEFINIRE
