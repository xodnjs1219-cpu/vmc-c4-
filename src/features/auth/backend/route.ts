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
} from "./schema";
import { signupUser, loginUser } from "./service";
import { authErrorCodes } from "./error";

export const registerAuthRoutes = (app: Hono<AppEnv>) => {
  app.post("/auth/signup", async (c) => {
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
  app.post("/auth/login", async (c) => {
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
};
