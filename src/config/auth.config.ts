import { registerAs } from '@nestjs/config';

// This service verifies tokens issued by identity-service's POST /token, against
// identity-service's published JWKS -- mirrors market-data-service's JWKS-based
// verification (see that repo's "Architecture Decisions" wiki page). Defaults assume
// identity-service running locally on its default port; override both for staging/prod.
export default registerAs('auth', () => ({
  jwksUri:
    process.env.AUTH_JWKS_URI ?? 'http://localhost:8080/.well-known/jwks.json',
  issuer: process.env.AUTH_ISSUER ?? 'http://localhost:8080',
}));
