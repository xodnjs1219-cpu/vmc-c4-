import type { Hono } from "hono";
import {
  failure,
  respond,
  type ErrorResult,
} from "@/backend/http/response";
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from "@/backend/hono/context";
import {
  SignupRequestSchema,
  type SignupServiceError,
  LoginRequestSchema,
  type LoginServiceError,
  ForgotPasswordRequestSchema,
  type PasswordResetServiceError,
  ResetPasswordRequestSchema,
} from "./schema";
import { signupUser, loginUser, requestPasswordReset, resetPassword } from "./service";
import { authErrorCodes } from "./error";

export const registerAuthRoutes = (app: Hono<AppEnv>) => {
  // 디버그용: 라우트 등록 확인
  console.log('[Auth Routes] Registering /api/auth/signup and /api/auth/login');

  app.post("/api/auth/signup", async (c) => {
    console.log('[Auth Routes] POST /api/auth/signup called');
    const body = await c.req.json();
    const parsedBody = SignupRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          "INVALID_SIGNUP_DATA",
          "입력 데이터가 올바르지 않습니다.",
          parsedBody.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await signupUser(supabase, parsedBody.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<SignupServiceError, unknown>;

      // 에러 로깅
      if (
        errorResult.error.code === authErrorCodes.signupFetchError ||
        errorResult.error.code === authErrorCodes.passwordHashError
      ) {
        logger.error("Signup failed", errorResult.error.message);
      }

      return respond(c, result);
    }

    return respond(c, result);
  });

  // 로그인 엔드포인트 (추가)
  app.post("/api/auth/login", async (c) => {
    const body = await c.req.json();
    const parsedBody = LoginRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          "INVALID_LOGIN_DATA",
          "입력 데이터가 올바르지 않습니다.",
          parsedBody.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await loginUser(supabase, parsedBody.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<LoginServiceError, unknown>;

      // 인증 실패는 일반 정보 로그, 서버 오류는 에러 로그
      if (errorResult.error.code === authErrorCodes.authFailed) {
        logger.info("Login failed - invalid credentials", {
          email: parsedBody.data.email,
        });
      } else if (
        errorResult.error.code === authErrorCodes.loginFetchError ||
        errorResult.error.code === authErrorCodes.passwordCompareError ||
        errorResult.error.code === authErrorCodes.tokenGenerationError
      ) {
        logger.error("Login failed", errorResult.error.message);
      }

      return respond(c, result);
    }

    logger.info("Login successful", {
      userId: result.data.user.id,
      email: result.data.user.email,
    });

    return respond(c, result);
  });

  // 비밀번호 재설정 요청 엔드포인트 (추가)
  app.post("/api/auth/forgot-password", async (c) => {
    const body = await c.req.json();
    const parsedBody = ForgotPasswordRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          "INVALID_FORGOT_PASSWORD_DATA",
          "입력 데이터가 올바르지 않습니다.",
          parsedBody.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await requestPasswordReset(supabase, parsedBody.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<
        PasswordResetServiceError,
        unknown
      >;

      // 에러 로깅
      if (
        errorResult.error.code === authErrorCodes.emailSendError ||
        errorResult.error.code === authErrorCodes.tokenGenerationError ||
        errorResult.error.code === authErrorCodes.loginFetchError
      ) {
        logger.error(
          "Password reset request failed",
          errorResult.error.message,
        );
      }

      return respond(c, result);
    }

    logger.info("Password reset email sent", {
      email: parsedBody.data.email,
    });

    return respond(c, result);
  });

  // 비밀번호 재설정 실행 엔드포인트 (추가)
  app.post("/api/auth/reset-password", async (c) => {
    const body = await c.req.json();
    const parsedBody = ResetPasswordRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          "INVALID_RESET_PASSWORD_DATA",
          "입력 데이터가 올바르지 않습니다.",
          parsedBody.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await resetPassword(supabase, parsedBody.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<
        PasswordResetServiceError,
        unknown
      >;

      // 에러 로깅
      if (errorResult.error.code === authErrorCodes.invalidToken) {
        logger.info("Invalid or expired reset token", {
          token: parsedBody.data.token.substring(0, 20) + "...",
        });
      } else if (
        errorResult.error.code === authErrorCodes.passwordHashError ||
        errorResult.error.code === authErrorCodes.passwordUpdateError ||
        errorResult.error.code === authErrorCodes.loginFetchError
      ) {
        logger.error("Password reset failed", errorResult.error.message);
      }

      return respond(c, result);
    }

    logger.info("Password reset successful");

    return respond(c, result);
  });
};
