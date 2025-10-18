import type { Hono } from "hono";
import {
  respond,
  failure,
  type ErrorResult,
} from "@/backend/http/response";
import {
  getLogger,
  getSupabase,
  getCurrentUser as getAuthUser,
  type AppEnv,
} from "@/backend/hono/context";
import { getCurrentUser, updateNickname } from "./service";
import { userErrorCodes } from "./error";
import { UpdateNicknameRequestSchema } from "./schema";
import type { UserServiceError } from "./schema";

export const registerUserRoutes = (app: Hono<AppEnv>) => {
  // 현재 사용자 정보 조회
  app.get("/api/users/me", async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const authUser = getAuthUser(c);

    // 인증 체크
    if (!authUser) {
      logger.warn("Unauthorized access to /api/users/me");
      return respond(
        c,
        failure(401, "UNAUTHORIZED", "인증이 필요합니다.")
      );
    }

    const result = await getCurrentUser(supabase, authUser.id);

    if (!result.ok) {
      const errorResult = result as ErrorResult<UserServiceError, unknown>;

      logger.error("Failed to fetch current user", {
        userId: authUser.id,
        code: errorResult.error.code,
        message: errorResult.error.message,
      });

      return respond(c, result);
    }

    logger.info("Current user fetched successfully", {
      userId: result.data.id,
    });

    return respond(c, result);
  });

  // 닉네임 업데이트
  app.patch("/api/users/me/nickname", async (c) => {
    const body = await c.req.json();
    const parsedBody = UpdateNicknameRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          "INVALID_NICKNAME_DATA",
          "입력 데이터가 올바르지 않습니다.",
          parsedBody.error.format()
        )
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const authUser = getAuthUser(c);

    // 인증 체크
    if (!authUser) {
      logger.warn("Unauthorized access to /api/users/me/nickname");
      return respond(
        c,
        failure(401, "UNAUTHORIZED", "인증이 필요합니다.")
      );
    }

    const result = await updateNickname(
      supabase,
      authUser.id,
      parsedBody.data.nickname
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<UserServiceError, unknown>;

      logger.error("Failed to update nickname", {
        userId: authUser.id,
        code: errorResult.error.code,
        message: errorResult.error.message,
      });

      return respond(c, result);
    }

    logger.info("Nickname updated successfully", {
      userId: authUser.id,
      newNickname: result.data.nickname,
    });

    return respond(c, result);
  });
};
