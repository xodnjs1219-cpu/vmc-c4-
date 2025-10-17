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

// 서비스 에러 타입
export type RoomServiceError = "ROOMS_FETCH_ERROR";
