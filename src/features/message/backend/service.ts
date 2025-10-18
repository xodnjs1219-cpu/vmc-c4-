import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import type {
  Message,
  CreateMessageRequest,
  GetMessagesRequest,
  MessageServiceError,
} from './schema';
import { messageErrorCodes } from './error';

const MESSAGES_TABLE = 'messages';
const MESSAGE_LIKES_TABLE = 'message_likes';
const USERS_TABLE = 'users';

// 메시지 목록 조회
export const getMessages = async (
  client: SupabaseClient,
  request: GetMessagesRequest,
  currentUserId: string
): Promise<
  HandlerResult<Message[], MessageServiceError, unknown>
> => {
  let query = client
    .from(MESSAGES_TABLE)
    .select(
      `
      id,
      chat_room_id,
      user_id,
      content,
      message_type,
      reply_to_message_id,
      is_deleted,
      created_at,
      users!user_id (
        nickname
      ),
      reply_to:messages!reply_to_message_id (
        id,
        content,
        is_deleted,
        users!user_id (
          nickname
        )
      ),
      message_likes (
        user_id
      )
      `
    )
    .eq('chat_room_id', request.roomId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(request.limit);

  if (request.before) {
    // before 파라미터가 있으면 해당 메시지 이전의 메시지만 조회
    const { data: beforeMessage } = await client
      .from(MESSAGES_TABLE)
      .select('created_at')
      .eq('id', request.before)
      .single();

    if (beforeMessage) {
      query = query.lt('created_at', beforeMessage.created_at);
    }
  }

  const { data: messages, error } = await query;

  if (error) {
    return failure(500, messageErrorCodes.messageCreateError, error.message);
  }

  // 응답 데이터 변환
  const transformedMessages: Message[] = (messages || []).map((msg: any) => ({
    id: msg.id,
    chatRoomId: msg.chat_room_id,
    userId: msg.user_id,
    authorNickname: msg.users?.nickname || '알 수 없음',
    content: msg.content,
    messageType: msg.message_type,
    replyToMessageId: msg.reply_to_message_id,
    replyToMessage: msg.reply_to && msg.reply_to.id
      ? {
          id: msg.reply_to.id,
          content: msg.reply_to.content,
          authorNickname: msg.reply_to.users?.nickname || '알 수 없음',
          isDeleted: msg.reply_to.is_deleted,
        }
      : undefined,
    likeCount: msg.message_likes?.length || 0,
    isLikedByMe:
      msg.message_likes?.some(
        (like: any) => like.user_id === currentUserId
      ) || false,
    isDeleted: msg.is_deleted,
    createdAt: msg.created_at,
  }));

  return success(transformedMessages, 200);
};

// 메시지 생성
export const createMessage = async (
  client: SupabaseClient,
  request: CreateMessageRequest,
  userId: string
): Promise<HandlerResult<Message, MessageServiceError, unknown>> => {
  // 메시지 생성
  const { data: newMessage, error: insertError } = await client
    .from(MESSAGES_TABLE)
    .insert({
      chat_room_id: request.roomId,
      user_id: userId,
      content: request.content,
      message_type: request.type,
      reply_to_message_id: request.replyToMessageId || null,
    })
    .select(
      `
      id,
      chat_room_id,
      user_id,
      content,
      message_type,
      reply_to_message_id,
      is_deleted,
      created_at,
      users!user_id (
        nickname
      )
      `
    )
    .single();

  if (insertError || !newMessage) {
    return failure(
      500,
      messageErrorCodes.messageCreateError,
      insertError?.message || '메시지 생성 중 오류가 발생했습니다'
    );
  }

  // 답장인 경우 원본 메시지 조회
  let replyToMessage = null;
  if (request.replyToMessageId) {
    const { data: originalMsg } = await client
      .from(MESSAGES_TABLE)
      .select(
        `
        id,
        content,
        is_deleted,
        users!user_id (
          nickname
        )
        `
      )
      .eq('id', request.replyToMessageId)
      .single();

    if (originalMsg) {
      const users = Array.isArray(originalMsg.users)
        ? originalMsg.users[0]
        : originalMsg.users;
      replyToMessage = {
        id: originalMsg.id,
        content: originalMsg.content,
        authorNickname: users?.nickname || '알 수 없음',
        isDeleted: originalMsg.is_deleted,
      };
    }
  }

  return success(
    {
      id: newMessage.id,
      chatRoomId: newMessage.chat_room_id,
      userId: newMessage.user_id,
      authorNickname: (Array.isArray(newMessage.users)
        ? newMessage.users[0]
        : newMessage.users)?.nickname || '알 수 없음',
      content: newMessage.content,
      messageType: newMessage.message_type,
      replyToMessageId: newMessage.reply_to_message_id,
      replyToMessage,
      likeCount: 0,
      isLikedByMe: false,
      isDeleted: newMessage.is_deleted,
      createdAt: newMessage.created_at,
    },
    201
  );
};

// 메시지 삭제
export const deleteMessage = async (
  client: SupabaseClient,
  messageId: string,
  userId: string
): Promise<
  HandlerResult<{ success: true }, MessageServiceError, unknown>
> => {
  // 메시지 조회 및 권한 확인
  const { data: message, error: fetchError } = await client
    .from(MESSAGES_TABLE)
    .select('user_id')
    .eq('id', messageId)
    .single();

  if (fetchError || !message) {
    return failure(
      404,
      messageErrorCodes.messageNotFound,
      '메시지를 찾을 수 없습니다'
    );
  }

  if (message.user_id !== userId) {
    return failure(
      403,
      messageErrorCodes.messageDeleteForbidden,
      '메시지를 삭제할 권한이 없습니다'
    );
  }

  // Soft delete
  const { error: deleteError } = await client
    .from(MESSAGES_TABLE)
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq('id', messageId);

  if (deleteError) {
    return failure(
      500,
      messageErrorCodes.messageCreateError,
      deleteError.message
    );
  }

  return success({ success: true }, 200);
};

// 좋아요 토글
export const toggleLike = async (
  client: SupabaseClient,
  messageId: string,
  userId: string
): Promise<
  HandlerResult<
    { likeCount: number; isLiked: boolean },
    MessageServiceError,
    unknown
  >
> => {
  // 기존 좋아요 확인
  const { data: existingLike, error: checkError } = await client
    .from(MESSAGE_LIKES_TABLE)
    .select('id')
    .eq('message_id', messageId)
    .eq('user_id', userId)
    .maybeSingle();

  if (checkError) {
    return failure(500, messageErrorCodes.messageLikeError, checkError.message);
  }

  let isLiked: boolean;

  if (existingLike) {
    // 좋아요 제거
    const { error: deleteError } = await client
      .from(MESSAGE_LIKES_TABLE)
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', userId);

    if (deleteError) {
      return failure(
        500,
        messageErrorCodes.messageLikeError,
        deleteError.message
      );
    }

    isLiked = false;
  } else {
    // 좋아요 추가
    const { error: insertError } = await client
      .from(MESSAGE_LIKES_TABLE)
      .insert({
        message_id: messageId,
        user_id: userId,
      });

    if (insertError) {
      return failure(
        500,
        messageErrorCodes.messageLikeError,
        insertError.message
      );
    }

    isLiked = true;
  }

  // 좋아요 카운트 조회
  const { count, error: countError } = await client
    .from(MESSAGE_LIKES_TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('message_id', messageId);

  if (countError) {
    return failure(
      500,
      messageErrorCodes.messageLikeError,
      countError.message
    );
  }

  return success({ likeCount: count || 0, isLiked }, 200);
};
