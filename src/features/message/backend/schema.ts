import { z } from 'zod';

// 메시지 타입
export const MessageTypeSchema = z.enum(['text', 'emoticon']);

// 메시지 스키마
export const MessageSchema = z.object({
  id: z.string().uuid(),
  chatRoomId: z.string().uuid(),
  userId: z.string().uuid(),
  authorNickname: z.string(),
  content: z.string(),
  messageType: MessageTypeSchema,
  replyToMessageId: z.string().uuid().nullable(),
  replyToMessage: z
    .object({
      id: z.string().uuid(),
      content: z.string(),
      authorNickname: z.string(),
      isDeleted: z.boolean(),
    })
    .nullable(),
  likeCount: z.number(),
  isLikedByMe: z.boolean(),
  isDeleted: z.boolean(),
  createdAt: z.string().datetime(),
});

export type Message = z.infer<typeof MessageSchema>;

// 메시지 생성 요청
export const CreateMessageRequestSchema = z.object({
  roomId: z.string().uuid(),
  content: z
    .string()
    .min(1, '메시지를 입력해주세요')
    .max(1000, '메시지는 최대 1000자까지 입력 가능합니다')
    .trim(),
  type: MessageTypeSchema.default('text'),
  replyToMessageId: z.string().uuid().optional(),
});

export type CreateMessageRequest = z.infer<
  typeof CreateMessageRequestSchema
>;

// 메시지 목록 조회 요청
export const GetMessagesRequestSchema = z.object({
  roomId: z.string().uuid(),
  before: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(50),
});

export type GetMessagesRequest = z.infer<typeof GetMessagesRequestSchema>;

// 좋아요 토글 요청
export const ToggleLikeRequestSchema = z.object({
  messageId: z.string().uuid(),
});

export type ToggleLikeRequest = z.infer<typeof ToggleLikeRequestSchema>;

// 메시지 삭제 요청
export const DeleteMessageRequestSchema = z.object({
  messageId: z.string().uuid(),
});

export type DeleteMessageRequest = z.infer<typeof DeleteMessageRequestSchema>;

// 서비스 에러 타입
export type MessageServiceError =
  | 'MESSAGE_CREATE_ERROR'
  | 'MESSAGE_NOT_FOUND'
  | 'MESSAGE_DELETE_FORBIDDEN'
  | 'MESSAGE_LIKE_ERROR'
  | 'UNAUTHORIZED';
