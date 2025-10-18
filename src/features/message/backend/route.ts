import type { Hono } from 'hono';
import {
  failure,
  respond,
  type ErrorResult,
} from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  getCurrentUser,
  type AppEnv,
} from '@/backend/hono/context';
import {
  getMessages,
  createMessage,
  deleteMessage,
  toggleLike,
} from './service';
import {
  CreateMessageRequestSchema,
  GetMessagesRequestSchema,
  type MessageServiceError,
} from './schema';
import { messageErrorCodes } from './error';

export const registerMessageRoutes = (app: Hono<AppEnv>) => {
  // 메시지 목록 조회
  app.get('/api/rooms/:roomId/messages', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const currentUser = getCurrentUser(c);
    const roomId = c.req.param('roomId');
    const before = c.req.query('before');
    const limit = parseInt(c.req.query('limit') || '50');

    if (!currentUser) {
      return respond(
        c,
        failure(401, messageErrorCodes.unauthorized, '인증이 필요합니다')
      );
    }

    const currentUserId = currentUser.id;

    const parsedRequest = GetMessagesRequestSchema.safeParse({
      roomId,
      before,
      limit,
    });

    if (!parsedRequest.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_GET_MESSAGES_DATA',
          '입력 데이터가 올바르지 않습니다.',
          parsedRequest.error.format()
        )
      );
    }

    const result = await getMessages(
      supabase,
      parsedRequest.data,
      currentUserId
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<MessageServiceError, unknown>;
      logger.error('Failed to fetch messages', errorResult.error.message);
      return respond(c, result);
    }

    logger.info('Messages fetched successfully', {
      count: result.data.length,
    });

    return respond(c, result);
  });

  // 메시지 생성
  app.post('/api/messages', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const currentUser = getCurrentUser(c);

    if (!currentUser) {
      return respond(
        c,
        failure(401, messageErrorCodes.unauthorized, '인증이 필요합니다')
      );
    }

    const body = await c.req.json();
    const parsedBody = CreateMessageRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_CREATE_MESSAGE_DATA',
          '입력 데이터가 올바르지 않습니다.',
          parsedBody.error.format()
        )
      );
    }

    const userId = currentUser.id;

    const result = await createMessage(supabase, parsedBody.data, userId);

    if (!result.ok) {
      const errorResult = result as ErrorResult<MessageServiceError, unknown>;
      logger.error('Failed to create message', errorResult.error.message);
      return respond(c, result);
    }

    logger.info('Message created successfully', {
      messageId: result.data.id,
    });

    return respond(c, result);
  });

  // 메시지 삭제
  app.delete('/api/messages/:messageId', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const currentUser = getCurrentUser(c);

    if (!currentUser) {
      return respond(
        c,
        failure(401, messageErrorCodes.unauthorized, '인증이 필요합니다')
      );
    }

    const messageId = c.req.param('messageId');
    const userId = currentUser.id;

    const result = await deleteMessage(supabase, messageId, userId);

    if (!result.ok) {
      const errorResult = result as ErrorResult<MessageServiceError, unknown>;
      logger.error('Failed to delete message', errorResult.error.message);
      return respond(c, result);
    }

    logger.info('Message deleted successfully', {
      messageId,
    });

    return respond(c, result);
  });

  // 좋아요 토글
  app.post('/api/messages/:messageId/like', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const currentUser = getCurrentUser(c);

    if (!currentUser) {
      return respond(
        c,
        failure(401, messageErrorCodes.unauthorized, '인증이 필요합니다')
      );
    }

    const messageId = c.req.param('messageId');
    const userId = currentUser.id;

    const result = await toggleLike(supabase, messageId, userId);

    if (!result.ok) {
      const errorResult = result as ErrorResult<MessageServiceError, unknown>;
      logger.error('Failed to toggle like', errorResult.error.message);
      return respond(c, result);
    }

    logger.info('Like toggled successfully', {
      messageId,
      isLiked: result.data.isLiked,
    });

    return respond(c, result);
  });

  // 좋아요 취소
  app.delete('/api/messages/:messageId/like', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const currentUser = getCurrentUser(c);

    if (!currentUser) {
      return respond(
        c,
        failure(401, messageErrorCodes.unauthorized, '인증이 필요합니다')
      );
    }

    const messageId = c.req.param('messageId');
    const userId = currentUser.id;

    const result = await toggleLike(supabase, messageId, userId);

    if (!result.ok) {
      const errorResult = result as ErrorResult<MessageServiceError, unknown>;
      logger.error('Failed to toggle like', errorResult.error.message);
      return respond(c, result);
    }

    logger.info('Like toggled successfully', {
      messageId,
      isLiked: result.data.isLiked,
    });

    return respond(c, result);
  });
};
