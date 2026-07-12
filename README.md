# client-data-service

Customer/persona data microservice for the sales-intelligence platform.

**Stack:** NestJS, TypeScript, TypeORM, Postgres.

**Out of scope for this service:** market/macro/news data (market-data-service),
auth/identity (identity-service), LLM briefing generation (briefing-service).

## Setup

```bash
npm install
cp .env.example .env   # fill in DB credentials + identity-service JWKS URL
npm run migration:run
npm run start:dev
```

Requires a running Postgres database and a running `identity-service` (tokens are
verified against its published JWKS — see that repo's "JWKS & Token Issuance" wiki
page). `/health/live` and `/health/ready` are public; every other route requires a
valid Bearer token.

## Testing

```bash
npm test        # unit tests
npm run test:e2e  # e2e tests -- boots the real app against the local Postgres DB,
                   # no mocked database (see AGENTS.md "Mock External Services" vs.
                   # the E2E section: mocking belongs in unit tests, not e2e)
```

## API docs

Swagger UI at `/docs`, only enabled when `NODE_ENV` is `local` or `staging`.

## Deploying to Vercel

Live at <https://client-data-service.vercel.app>.

`api/index.ts` is the Vercel serverless entrypoint. It dynamically imports the
*compiled* `dist/create-app.js` (not `src/create-app.ts`) and builds the Nest app once,
reusing it across warm invocations — mirrors identity-service's `pkg/server.New()` +
`api/index.go` pattern. `src/main.ts` (the long-running dev server) and `api/index.ts`
both call the same `createApp()`, so app wiring only lives in one place.

To deploy:

```bash
vercel link                        # first time only
vercel env add DB_HOST production  # ...and the rest of .env.example's vars
vercel --prod
```

Requirements:

- `DB_SSL=true` in production — Neon (and most managed Postgres) requires SSL; local
  trust-auth Postgres doesn't set this.
- `AUTH_JWKS_URI` / `AUTH_ISSUER` must point at identity-service's **production**
  deployment (`https://identity-service-seven.vercel.app/...`), not localhost.
- Run `npm run migration:run` against the production database before or right after
  the first deploy (sourced from a gitignored env file, never inlined on the command
  line — see identity-service's "Deploying to Vercel" wiki page for why).
- Production Postgres is a separate Neon project from every other service's DB (same
  isolation reasoning as identity-service's DB decision — blast radius, connection
  limits, independent scaling).
- Vercel's default build expects a static `public/` output directory even for
  API-only projects; `public/.gitkeep` is a placeholder, not real content.

Known limitation carried over from the other two services: the in-process rate
limiter (`@nestjs/throttler`, in-memory storage) is per-instance under serverless
scale-out, not global. Accepted, not fixed — see identity-service's wiki page for the
full reasoning.

## Status

- [x] NestJS service scaffold — TypeORM + Postgres, JWKS-based auth guard, rate
      limiting, structured JSON logging (`nestjs-pino`), Terminus health checks,
      global validation + exception filter, Swagger gated to local/staging.
- [x] Customer/persona domain model — `Customer` (name, domain, industry,
      employeeCount, status) and `Persona` (name, email, title), one-to-many.
- [x] CRUD API + first real bruno requests beyond health — `/customers` and
      `/customers/:customerId/personas`, all requiring a Bearer token.
- [x] Deployed to Vercel — <https://client-data-service.vercel.app>, production
      Postgres on a dedicated Neon project.

## Conventions

See `AGENTS.md` for coding conventions and `CONTRIBUTING.md` for the workflow
(work items, branches, commits, wiki).
