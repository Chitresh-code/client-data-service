import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from './jwt.strategy';

// Request has already passed through JwtAuthGuard by the time a handler
// using this decorator runs -- req.user is always a JwtPayload, never
// undefined, on any non-@Public() route.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    return ctx.switchToHttp().getRequest<Request & { user: JwtPayload }>().user;
  },
);
