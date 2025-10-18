import { z } from "zod";

export const createRoomFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "채팅방 이름을 입력해주세요" })
    .max(100, { message: "채팅방 이름은 최대 100자까지 입력할 수 있습니다" })
    .trim(),
});

export type CreateRoomFormData = z.infer<typeof createRoomFormSchema>;
