# SSA-SDS Analyzer - Frontend

Angular 18.2 frontend for the SSA-SDS Analyzer application.

## Features
- Client management (CRUD)
- Safety card management (CRUD) with PDF upload
- Excel import with history
- LLM PDF analysis (text extraction + OCR + GHS pictogram recognition)
- Expiration tracking and notifications
- JWT authentication with automatic token refresh
- Dashboard with statistics

## Development server

To start a local development server, run:

```bash
npm install
ng serve
```

The server proxies `/api/*` requests to `http://localhost:5007` (see `proxy.conf.json`).

Once the server is running, open your browser and navigate to `http://localhost:4200/`.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory.

For production build (used by SPA deployment):

```bash
ng build --configuration production
```

The output is copied to `api/SSA.SDS.Api/wwwroot/` by `build-spa.bat` or `build-spa.sh`.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

## Project Structure

```
src/app/
├── core/
│   ├── guards/          # Auth guard
│   ├── interceptors/    # Auth interceptor (JWT + refresh)
│   ├── models/          # Client, SafetyCard, SDS fields
│   └── services/        # API services
├── features/
│   ├── auth/            # Login
│   ├── clients/         # Client list, form, detail
│   ├── safety-cards/    # Card list, form
│   ├── import/          # Excel import
│   └── scenarios/       # Dashboard, expiring cards
├── layout/              # Navbar
└── shared/              # Shared components
```

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
