import type { SupabaseClient } from "@supabase/supabase-js";
import {
  failure,
  success,
  type HandlerResult,
} from "@/backend/http/response";
import type {
  GetUserResponse,
  UpdateNicknameResponse,
  UserServiceError,
} from "./schema";
import { userErrorCodes } from "./error";

const USERS_TABLE = "users";

/**
 * 현재 사용자 정보 조회
 */
export const getCurrentUser = async (
  client: SupabaseClient,
  userId: string
): Promise<HandlerResult<GetUserResponse, UserServiceError, unknown>> => {
  const { data: user, error } = await client
    .from(USERS_TABLE)
    .select("id, email, nickname, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return failure(500, userErrorCodes.userFetchError, error.message);
  }

  if (!user) {
    return failure(
      404,
      userErrorCodes.userNotFound,
      "사용자를 찾을 수 없습니다"
    );
  }

  return success(
    {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      createdAt: user.created_at,
    },
    200
  );
};

/**
 * 닉네임 업데이트
 */
export const updateNickname = async (
  client: SupabaseClient,
  userId: string,
  newNickname: string
): Promise<HandlerResult<UpdateNicknameResponse, UserServiceError, unknown>> => {
  // 입력 위생 처리
  const trimmedNickname = newNickname.trim();

  // 1. 현재 사용자 정보 조회 (현재 닉네임 확인)
  const { data: currentUser, error: fetchError } = await client
    .from(USERS_TABLE)
    .select("nickname")
    .eq("id", userId)
    .maybeSingle();

  if (fetchError) {
    return failure(500, userErrorCodes.userFetchError, fetchError.message);
  }

  if (!currentUser) {
    return failure(
      404,
      userErrorCodes.userNotFound,
      "사용자를 찾을 수 없습니다"
    );
  }

  // 2. 현재 닉네임과 동일한지 확인
  if (currentUser.nickname === trimmedNickname) {
    return failure(
      400,
      userErrorCodes.nicknameSame,
      "현재 닉네임과 동일합니다"
    );
  }

  // 3. 닉네임 중복 확인 (대소문자 구분 없이)
  const { data: duplicateUser, error: duplicateError } = await client
    .from(USERS_TABLE)
    .select("id")
    .ilike("nickname", trimmedNickname)
    .neq("id", userId)
    .maybeSingle();

  if (duplicateError) {
    return failure(500, userErrorCodes.userFetchError, duplicateError.message);
  }

  if (duplicateUser) {
    return failure(
      409,
      userErrorCodes.nicknameDuplicate,
      "이미 사용 중인 닉네임입니다"
    );
  }

  // 4. 닉네임 업데이트
  const { error: updateError } = await client
    .from(USERS_TABLE)
    .update({ nickname: trimmedNickname })
    .eq("id", userId);

  if (updateError) {
    return failure(
      500,
      userErrorCodes.nicknameUpdateError,
      updateError.message
    );
  }

  return success({ nickname: trimmedNickname }, 200);
};
