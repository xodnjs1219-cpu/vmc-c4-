import { z } from "zod";

export const SignupRequestSchema = z
  .object({
    nickname: z
      .string()
      .min(1, { message: "닉네임은 필수입니다" })
      .trim(),
    email: z
      .string()
      .min(1, { message: "이메일은 필수입니다" })
      .email({ message: "올바른 이메일 형식이 아닙니다" }),
    password: z
      .string()
      .min(8, { message: "비밀번호는 8자 이상이어야 합니다" }),
    passwordConfirm: z
      .string()
      .min(1, { message: "비밀번호 확인은 필수입니다" }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["passwordConfirm"],
  });

export type SignupRequest = z.infer<typeof SignupRequestSchema>;

export const SignupResponseSchema = z.object({
  message: z.string(),
});

export type SignupResponse = z.infer<typeof SignupResponseSchema>;

// 서비스 에러 타입
export type SignupServiceError =
  | "NICKNAME_DUPLICATE"
  | "EMAIL_DUPLICATE"
  | "SIGNUP_FETCH_ERROR"
  | "PASSWORD_HASH_ERROR";

export const LoginRequestSchema = z.object({
  email: z
    .string()
    .min(1, { message: "이메일은 필수입니다" })
    .email({ message: "올바른 이메일 형식이 아닙니다" }),
  password: z
    .string()
    .min(8, { message: "비밀번호는 8자 이상이어야 합니다" }),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    nickname: z.string(),
    createdAt: z.string(),
  }),
  token: z.string(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// 로그인 서비스 에러 타입
export type LoginServiceError =
  | "AUTH_FAILED"
  | "LOGIN_FETCH_ERROR"
  | "PASSWORD_COMPARE_ERROR"
  | "TOKEN_GENERATION_ERROR";
