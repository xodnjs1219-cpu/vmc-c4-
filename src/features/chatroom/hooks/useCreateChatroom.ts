"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/remote/api-client";

type CreateRoomRequest = {
  name: string;
};

type CreateRoomResponse = {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
};

type CreateRoomError = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export const useCreateChatroom = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<
    CreateRoomResponse,
    CreateRoomError,
    CreateRoomRequest
  >({
    mutationFn: async (data) => {
      const response = await apiClient.post<CreateRoomResponse>(
        "/api/rooms",
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      // 1. 채팅방 목록 쿼리 무효화 (홈 페이지 자동 업데이트)
      queryClient.invalidateQueries({ queryKey: ["rooms"] });

      // 2. 새로 생성된 채팅방 페이지로 리디렉션
      router.push(`/room/${data.id}`);
    },
  });
};
