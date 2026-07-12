# client-data-service

Customer and persona data microservice for the sales-intelligence platform: stores the accounts being sold to and their contact personas, and exposes a CRUD API over them.

**Stack:** NestJS, TypeScript, TypeORM, Postgres.

This service is mostly straightforward relational CRUD (customers, personas), which is exactly what NestJS is built for — guards, DTO validation, and migrations come as enforced conventions rather than things to hand-roll, which keeps a small CRUD service consistent without much boilerplate.

## What it does

- `Customer` — an account being sold to (name, domain, industry, employee count, status).
- `Persona` — a contact at a customer (name, email, title), nested under its customer.
- Full CRUD over both, at `/customers` and `/customers/:customerId/personas`.
- Every route except health checks requires a Bearer token, verified against identity-service's published JWKS.

## Running locally

Requires a running Postgres database and a running `identity-service`.

```bash
npm install
cp .env.example .env   # fill in DB credentials and identity-service's JWKS URL
npm run migration:run
npm run start:dev
```

## Testing

```bash
npm test          # unit tests
npm run test:e2e  # e2e tests against a real local Postgres database
```

## API docs

Swagger UI is available at `/docs` in local and staging environments.

## Contributing

See `AGENTS.md` for coding conventions and `CONTRIBUTING.md` for the contribution workflow.
