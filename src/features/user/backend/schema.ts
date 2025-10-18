import { z } from "zod";

// 사용자 정보 조회 응답 스키마
export const GetUserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  nickname: z.string(),
  createdAt: z.string().datetime(),
});

export type GetUserResponse = z.infer<typeof GetUserResponseSchema>;

// 닉네임 업데이트 요청 스키마
export const UpdateNicknameRequestSchema = z.object({
  nickname: z
    .string()
    .min(1, { message: "닉네임은 필수입니다" })
    .min(2, { message: "닉네임은 2자 이상이어야 합니다" })
    .max(20, { message: "닉네임은 20자 이하여야 합니다" })
    .trim(),
});

export type UpdateNicknameRequest = z.infer<typeof UpdateNicknameRequestSchema>;

// 닉네임 업데이트 응답 스키마
export const UpdateNicknameResponseSchema = z.object({
  nickname: z.string(),
});

export type UpdateNicknameResponse = z.infer<typeof UpdateNicknameResponseSchema>;

// 서비스 에러 타입
export type UserServiceError =
  | "USER_NOT_FOUND"
  | "USER_FETCH_ERROR"
  | "NICKNAME_DUPLICATE"
  | "NICKNAME_SAME"
  | "NICKNAME_UPDATE_ERROR";
