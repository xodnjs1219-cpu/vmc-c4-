import type { SupabaseClient } from "@supabase/supabase-js";
import {
  failure,
  success,
  type HandlerResult,
} from "@/backend/http/response";
import type { RoomsResponse, RoomServiceError } from "./schema";

const CHAT_ROOMS_TABLE = "chat_rooms";

export const getRooms = async (
  client: SupabaseClient
): Promise<HandlerResult<RoomsResponse, RoomServiceError, unknown>> => {
  // 채팅방 목록 조회 (개설자 정보 JOIN)
  const { data: rooms, error } = await client
    .from(CHAT_ROOMS_TABLE)
    .select(
      `
      id,
      name,
      creator_id,
      created_at,
      users!creator_id (
        nickname
      )
      `
    )
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    return failure(
      500,
      "ROOMS_FETCH_ERROR",
      error.message
    );
  }

  // 응답 데이터 변환
  const transformedRooms = (rooms || []).map((room: any) => ({
    id: room.id,
    name: room.name,
    creatorId: room.creator_id,
    creatorNickname: room.users?.nickname || "알 수 없음",
    createdAt: room.created_at,
  }));

  return success(transformedRooms, 200);
};
