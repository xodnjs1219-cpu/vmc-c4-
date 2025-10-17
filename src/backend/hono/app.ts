import { Hono } from 'hono';
import { errorBoundary } from '@/backend/middleware/error';
import { withAppContext } from '@/backend/middleware/context';
import { withSupabase } from '@/backend/middleware/supabase';
import { registerExampleRoutes } from '@/features/example/backend/route';
import { registerAuthRoutes } from '@/features/auth/backend/route';
import type { AppEnv } from '@/backend/hono/context';

// 전역 캐시 (개발 환경에서도 안정적)
const globalForHono = globalThis as unknown as {
  hono: Hono<AppEnv> | undefined;
};

export const createHonoApp = () => {
  if (globalForHono.hono) {
    console.log('[Hono] Reusing existing app instance');
    return globalForHono.hono;
  }

  console.log('[Hono] Creating new app instance');
  const app = new Hono<AppEnv>();

  // 디버그: 모든 요청 로깅
  app.use('*', async (c, next) => {
    console.log(`[Hono] ${c.req.method} ${c.req.url}`);
    console.log(`[Hono] Path: ${c.req.path}`);
    await next();
  });

  app.use('*', errorBoundary());
  app.use('*', withAppContext());
  app.use('*', withSupabase());

  // 디버그용 라우트
  app.get('/api/health', (c) => c.json({ status: 'ok', message: 'Hono app is running' }));

  registerExampleRoutes(app);
  registerAuthRoutes(app);

  // 등록된 모든 라우트 출력
  console.log('[Hono] Registered routes:');
  app.routes.forEach((route) => {
    console.log(`  ${route.method} ${route.path}`);
  });

  globalForHono.hono = app;

  return app;
};
