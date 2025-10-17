import { z } from "zod";

export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "이메일을 입력해주세요" })
    .email({ message: "올바른 이메일 형식을 입력해주세요" }),
  password: z
    .string()
    .min(8, { message: "비밀번호는 8자 이상이어야 합니다" }),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;
