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

## Status

- [x] NestJS service scaffold — TypeORM + Postgres, JWKS-based auth guard, rate
      limiting, structured JSON logging (`nestjs-pino`), Terminus health checks,
      global validation + exception filter, Swagger gated to local/staging.
- [x] Customer/persona domain model — `Customer` (name, domain, industry,
      employeeCount, status) and `Persona` (name, email, title), one-to-many.
- [x] CRUD API + first real bruno requests beyond health — `/customers` and
      `/customers/:customerId/personas`, all requiring a Bearer token.

## Conventions

See `AGENTS.md` for coding conventions and `CONTRIBUTING.md` for the workflow
(work items, branches, commits, wiki).
