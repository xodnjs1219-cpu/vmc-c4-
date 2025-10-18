import { z } from "zod";

// 채팅방 목록 응답 스키마
export const RoomSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  creatorId: z.string().uuid(),
  creatorNickname: z.string(),
  createdAt: z.string().datetime(),
});

export const RoomsResponseSchema = z.array(RoomSchema);

export type Room = z.infer<typeof RoomSchema>;
export type RoomsResponse = z.infer<typeof RoomsResponseSchema>;

// 채팅방 생성 요청 스키마
export const CreateRoomRequestSchema = z.object({
  name: z
    .string()
    .min(1, { message: "채팅방 이름을 입력해주세요" })
    .max(100, { message: "채팅방 이름은 최대 100자까지 입력할 수 있습니다" })
    .trim(),
});

export type CreateRoomRequest = z.infer<typeof CreateRoomRequestSchema>;

// 채팅방 생성 응답 스키마
export const CreateRoomResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export type CreateRoomResponse = z.infer<typeof CreateRoomResponseSchema>;

// 서비스 에러 타입
export type RoomServiceError =
  | "ROOMS_FETCH_ERROR"
  | "ROOM_NOT_FOUND"
  | "ROOM_DELETED"
  | "ROOM_NAME_DUPLICATE"
  | "ROOM_CREATE_ERROR"
  | "UNAUTHORIZED";
