import type { SupabaseClient } from "@supabase/supabase-js";
import {
  failure,
  success,
  type HandlerResult,
} from "@/backend/http/response";
import type {
  RoomsResponse,
  RoomServiceError,
  CreateRoomRequest,
  CreateRoomResponse,
} from "./schema";

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

// 채팅방 생성 함수 (추가)
export const createRoom = async (
  client: SupabaseClient,
  data: CreateRoomRequest,
  creatorId: string
): Promise<HandlerResult<CreateRoomResponse, RoomServiceError, unknown>> => {
  // 1. 채팅방 이름 중복 확인
  const { data: existingRoom, error: checkError } = await client
    .from(CHAT_ROOMS_TABLE)
    .select("id")
    .eq("name", data.name)
    .eq("is_deleted", false)
    .maybeSingle();

  if (checkError) {
    return failure(
      500,
      "ROOM_CREATE_ERROR",
      checkError.message
    );
  }

  if (existingRoom) {
    return failure(
      409,
      "ROOM_NAME_DUPLICATE",
      "이미 존재하는 채팅방 이름입니다. 다른 이름을 입력해주세요"
    );
  }

  // 2. 채팅방 생성
  const { data: newRoom, error: insertError } = await client
    .from(CHAT_ROOMS_TABLE)
    .insert({
      name: data.name,
      creator_id: creatorId,
    })
    .select("id, name, creator_id, created_at")
    .single();

  if (insertError || !newRoom) {
    return failure(
      500,
      "ROOM_CREATE_ERROR",
      insertError?.message || "채팅방 생성 중 오류가 발생했습니다"
    );
  }

  // 3. 성공 응답
  return success(
    {
      id: newRoom.id,
      name: newRoom.name,
      createdBy: newRoom.creator_id,
      createdAt: newRoom.created_at,
    },
    201
  );
};
