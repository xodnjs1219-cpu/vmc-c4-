import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';
import { contextKeys, type AppEnv } from '@/backend/hono/context';

export const withAuth = () => {
  return createMiddleware<AppEnv>(async (c, next) => {
    // 쿠키에서 토큰 추출
    const token = getCookie(c, 'auth_token');

    if (token) {
      // TODO: JWT 검증 로직 추가
      // 현재는 토큰에서 사용자 정보를 직접 파싱 (간단한 구현)
      try {
        // JWT 디코딩 (실제로는 jwt.verify 사용해야 함)
        const payload = JSON.parse(
          Buffer.from(token.split('.')[1], 'base64').toString()
        );
        
        c.set(contextKeys.currentUser, {
          id: payload.userId,
          email: payload.email,
          nickname: payload.nickname,
        });
      } catch (error) {
        console.warn('[Auth] Failed to parse token:', error);
      }
    }

    await next();
  });
};
