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
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  PasswordResetServiceError,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "./schema";
import { authErrorCodes } from "./error";
import { generateToken, generateResetToken, verifyResetToken } from "./jwt";
import { sendPasswordResetEmail } from "./email";

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

// 비밀번호 재설정 요청 (1단계: 이메일 전송)
export const requestPasswordReset = async (
  client: SupabaseClient,
  data: ForgotPasswordRequest,
): Promise<
  HandlerResult<ForgotPasswordResponse, PasswordResetServiceError, unknown>
> => {
  // 1. 이메일로 사용자 조회
  const { data: user, error: fetchError } = await client
    .from(USERS_TABLE)
    .select("id, email")
    .eq("email", data.email)
    .maybeSingle();

  if (fetchError) {
    return failure(
      500,
      authErrorCodes.loginFetchError as PasswordResetServiceError,
      fetchError.message,
    );
  }

  // 2. 사용자가 없어도 보안상 동일한 응답 반환
  // (이메일 존재 여부를 노출하지 않음)
  if (!user) {
    return success(
      {
        message:
          "이메일로 비밀번호 재설정 링크를 전송했습니다. 이메일을 확인해주세요.",
      },
      200,
    );
  }

  // 3. 재설정 토큰 생성
  let resetToken: string;
  try {
    resetToken = await generateResetToken(user.id, user.email);
  } catch {
    return failure(
      500,
      authErrorCodes.tokenGenerationError as PasswordResetServiceError,
      "토큰 생성 중 오류가 발생했습니다",
    );
  }

  // 4. 이메일 전송
  const emailResult = await sendPasswordResetEmail({
    to: user.email,
    resetToken,
  });

  if (!emailResult.success) {
    return failure(
      500,
      authErrorCodes.emailSendError as PasswordResetServiceError,
      emailResult.error || "이메일 전송 중 오류가 발생했습니다",
    );
  }

  // 5. 성공 응답
  return success(
    {
      message:
        "이메일로 비밀번호 재설정 링크를 전송했습니다. 이메일을 확인해주세요.",
    },
    200,
  );
};

// 비밀번호 재설정 실행 (2단계: 새 비밀번호 설정)
export const resetPassword = async (
  client: SupabaseClient,
  data: ResetPasswordRequest,
): Promise<
  HandlerResult<ResetPasswordResponse, PasswordResetServiceError, unknown>
> => {
  // 1. 토큰 검증
  const payload = await verifyResetToken(data.token);

  if (!payload) {
    return failure(
      401,
      authErrorCodes.invalidToken as PasswordResetServiceError,
      "유효하지 않거나 만료된 토큰입니다",
    );
  }

  // 2. 사용자 조회 (토큰의 userId로)
  const { data: user, error: fetchError } = await client
    .from(USERS_TABLE)
    .select("id, email")
    .eq("id", payload.userId)
    .maybeSingle();

  if (fetchError) {
    return failure(
      500,
      authErrorCodes.loginFetchError as PasswordResetServiceError,
      fetchError.message,
    );
  }

  if (!user) {
    return failure(
      404,
      authErrorCodes.userNotFound as PasswordResetServiceError,
      "사용자를 찾을 수 없습니다",
    );
  }

  // 3. 비밀번호 해싱
  let passwordHash: string;
  try {
    passwordHash = await hash(data.password, BCRYPT_ROUNDS);
  } catch {
    return failure(
      500,
      authErrorCodes.passwordHashError as PasswordResetServiceError,
      "비밀번호 암호화 중 오류가 발생했습니다",
    );
  }

  // 4. 비밀번호 업데이트
  const { error: updateError } = await client
    .from(USERS_TABLE)
    .update({ password_hash: passwordHash })
    .eq("id", user.id);

  if (updateError) {
    return failure(
      500,
      authErrorCodes.passwordUpdateError as PasswordResetServiceError,
      updateError.message,
    );
  }

  // 5. 성공 응답
  return success(
    {
      message: "비밀번호가 성공적으로 변경되었습니다",
    },
    200,
  );
};
