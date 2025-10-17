import type { SupabaseClient } from "@supabase/supabase-js";
import { hash, compare } from "bcryptjs";
import {
  failure,
  success,
  type HandlerResult,
} from "@/backend/http/response";
import type {
  SignupRequest,
  SignupResponse,
  SignupServiceError,
  LoginRequest,
  LoginResponse,
  LoginServiceError,
} from "./schema";
import { authErrorCodes } from "./error";
import { generateToken } from "./jwt";

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

export const loginUser = async (
  client: SupabaseClient,
  data: LoginRequest,
): Promise<
  HandlerResult<LoginResponse, LoginServiceError, unknown>
> => {
  // 1. 이메일로 사용자 조회
  const { data: user, error: fetchError } = await client
    .from(USERS_TABLE)
    .select("id, email, nickname, password_hash, created_at")
    .eq("email", data.email)
    .maybeSingle();

  if (fetchError) {
    return failure(
      500,
      authErrorCodes.loginFetchError as LoginServiceError,
      fetchError.message,
    );
  }

  // 2. 사용자 없음 - 보안상 통합 메시지
  if (!user) {
    return failure(
      401,
      authErrorCodes.authFailed as LoginServiceError,
      "이메일 또는 비밀번호가 일치하지 않습니다",
    );
  }

  // 3. 비밀번호 검증
  let isPasswordValid = false;
  try {
    isPasswordValid = await compare(data.password, user.password_hash);
  } catch {
    return failure(
      500,
      authErrorCodes.passwordCompareError as LoginServiceError,
      "비밀번호 검증 중 오류가 발생했습니다",
    );
  }

  // 4. 비밀번호 불일치 - 보안상 통합 메시지
  if (!isPasswordValid) {
    return failure(
      401,
      authErrorCodes.authFailed as LoginServiceError,
      "이메일 또는 비밀번호가 일치하지 않습니다",
    );
  }

  // 5. JWT 토큰 생성
  let token: string;
  try {
    token = await generateToken({
      userId: user.id,
      email: user.email,
      nickname: user.nickname,
    });
  } catch {
    return failure(
      500,
      authErrorCodes.tokenGenerationError as LoginServiceError,
      "토큰 생성 중 오류가 발생했습니다",
    );
  }

  // 6. 성공 응답
  return success(
    {
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        createdAt: user.created_at,
      },
      token,
    },
    200,
  );
};
