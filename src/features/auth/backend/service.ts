import type { SupabaseClient } from "@supabase/supabase-js";
import { hash } from "bcryptjs";
import {
  failure,
  success,
  type HandlerResult,
} from "@/backend/http/response";
import type {
  SignupRequest,
  SignupResponse,
  SignupServiceError,
} from "./schema";
import { authErrorCodes } from "./error";

const USERS_TABLE = "users";
const BCRYPT_ROUNDS = 10;

export const signupUser = async (
  client: SupabaseClient,
  data: SignupRequest,
): Promise<
  HandlerResult<SignupResponse, SignupServiceError, unknown>
> => {
  // 1. 닉네임 중복 확인
  const { data: nicknameExists, error: nicknameError } = await client
    .from(USERS_TABLE)
    .select("id")
    .eq("nickname", data.nickname)
    .maybeSingle();

  if (nicknameError) {
    return failure(
      500,
      authErrorCodes.signupFetchError as SignupServiceError,
      nicknameError.message,
    );
  }

  if (nicknameExists) {
    return failure(
      409,
      authErrorCodes.nicknameDuplicate as SignupServiceError,
      "이미 사용 중인 닉네임입니다",
    );
  }

  // 2. 이메일 중복 확인
  const { data: emailExists, error: emailError } = await client
    .from(USERS_TABLE)
    .select("id")
    .eq("email", data.email)
    .maybeSingle();

  if (emailError) {
    return failure(
      500,
      authErrorCodes.signupFetchError as SignupServiceError,
      emailError.message,
    );
  }

  if (emailExists) {
    return failure(
      409,
      authErrorCodes.emailDuplicate as SignupServiceError,
      "이미 가입된 이메일입니다",
    );
  }

  // 3. 비밀번호 해싱
  let passwordHash: string;
  try {
    passwordHash = await hash(data.password, BCRYPT_ROUNDS);
  } catch {
    return failure(
      500,
      authErrorCodes.passwordHashError as SignupServiceError,
      "비밀번호 암호화 중 오류가 발생했습니다",
    );
  }

  // 4. 사용자 생성
  const { error: insertError } = await client.from(USERS_TABLE).insert({
    nickname: data.nickname,
    email: data.email,
    password_hash: passwordHash,
  });

  if (insertError) {
    return failure(
      500,
      authErrorCodes.signupFetchError as SignupServiceError,
      insertError.message,
    );
  }

  // 5. 성공 응답
  return success(
    { message: "회원가입이 완료되었습니다" },
    201,
  );
};
