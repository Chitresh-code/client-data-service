import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  iss: string;
  exp: number;
  // Present only on end-user tokens (identity-service's POST /auth/exchange),
  // absent on application tokens (POST /token). "member" | "lead" in
  // practice, kept as string here since this is just the transport shape.
  role?: string;
  [claim: string]: unknown;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['RS256'],
      issuer: config.get<string>('auth.issuer'),
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: config.get<string>('auth.jwksUri')!,
      }),
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    // passport-jwt has already verified signature, expiry, and issuer against
    // identity-service's JWKS by the time this runs -- just becomes req.user.
    return payload;
  }
}
