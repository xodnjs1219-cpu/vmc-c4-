import type { Hono } from "hono";
import {
  respond,
  type ErrorResult,
} from "@/backend/http/response";
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from "@/backend/hono/context";
import { getRooms } from "./service";
import type { RoomServiceError } from "./schema";

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
};
