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
import { getRooms, createRoom } from "./service";
import type { RoomServiceError, CreateRoomRequest } from "./schema";
import { CreateRoomRequestSchema } from "./schema";
import { roomErrorCodes } from "./error";
import { verifyToken } from "@/features/auth/backend/jwt";

export const registerRoomRoutes = (app: Hono<AppEnv>) => {
  // 채팅방 목록 조회
  app.get("/api/rooms", async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await getRooms(supabase);

    if (!result.ok) {
      const errorResult = result as ErrorResult<RoomServiceError, unknown>;

      logger.error("Failed to fetch rooms", {
        code: errorResult.error.code,
        message: errorResult.error.message,
      });

      return respond(c, result);
    }

    logger.info("Rooms fetched successfully", {
      count: result.data.length,
    });

    return respond(c, result);
  });

  // 채팅방 생성
  app.post("/api/rooms", async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // 요청 본문 파싱 및 검증
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return respond(
        c,
        failure(
          400,
          "INVALID_REQUEST_BODY",
          "요청 본문이 유효한 JSON이 아닙니다"
        )
      );
    }

    const parsedBody = CreateRoomRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          "INVALID_CREATE_ROOM_DATA",
          "입력 데이터가 올바르지 않습니다",
          parsedBody.error.flatten()
        )
      );
    }

    // 인증 확인 - 쿠키에서 토큰 추출
    const cookies = c.req.header("cookie") || "";
    const authTokenMatch = cookies.match(/auth_token=([^;]+)/);
    const token = authTokenMatch?.[1];

    if (!token) {
      logger.warn("Create room attempt without auth token");
      return respond(
        c,
        failure(
          401,
          roomErrorCodes.unauthorized,
          "로그인이 필요합니다"
        )
      );
    }

    // JWT 토큰 검증
    const tokenPayload = await verifyToken(token);

    if (!tokenPayload) {
      logger.warn("Invalid or expired auth token");
      return respond(
        c,
        failure(
          401,
          roomErrorCodes.unauthorized,
          "유효하지 않거나 만료된 토큰입니다"
        )
      );
    }

    const creatorId = tokenPayload.userId;

    // 채팅방 생성
    const result = await createRoom(supabase, parsedBody.data, creatorId);

    if (!result.ok) {
      const errorResult = result as ErrorResult<RoomServiceError, unknown>;

      // 에러 로깅
      if (errorResult.error.code === roomErrorCodes.roomCreateError) {
        logger.error("Failed to create room", {
          error: errorResult.error.message,
        });
      } else if (errorResult.error.code === roomErrorCodes.roomNameDuplicate) {
        logger.info("Room name duplicate", {
          name: parsedBody.data.name,
        });
      }

      return respond(c, result);
    }

    logger.info("Room created successfully", {
      roomId: result.data.id,
      name: result.data.name,
      creatorId: result.data.createdBy,
    });

    return respond(c, result);
  });
};
