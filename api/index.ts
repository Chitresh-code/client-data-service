import type { IncomingMessage, ServerResponse } from 'http';

type RequestHandler = (req: IncomingMessage, res: ServerResponse) => void;

// Built once and reused across warm invocations -- mirrors identity-service's
// api/index.go init() pattern.
let handlerPromise: Promise<RequestHandler> | null = null;

async function buildHandler(): Promise<RequestHandler> {
  // Dynamic import of the *compiled* app (dist/, produced by `nest build`'s tsc)
  // rather than src/create-app.ts -- decorator metadata (emitDecoratorMetadata) needs
  // a real type-checking compile, which Vercel's zero-config bundling for files under
  // api/ isn't guaranteed to do. Requires vercel.json's buildCommand to run
  // `npm run build` before this file is invoked.
  const { createApp } =
    (await import('../dist/create-app.js')) as typeof import('../src/create-app');

  const app = await createApp();
  await app.init();
  return app.getHttpAdapter().getInstance() as RequestHandler;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  if (!handlerPromise) {
    handlerPromise = buildHandler();
  }
  const expressHandler = await handlerPromise;
  expressHandler(req, res);
}
