import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, extractApiErrorMessage } from "@/lib/remote/api-client";

type UpdateNicknameRequest = {
  nickname: string;
};

type UpdateNicknameResponse = {
  nickname: string;
};

export const useUpdateNickname = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateNicknameResponse,
    Error,
    UpdateNicknameRequest
  >({
    mutationFn: async (data) => {
      const response = await apiClient.patch<UpdateNicknameResponse>(
        "/api/users/me/nickname",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      // 사용자 정보 쿼리 무효화 (자동 refetch)
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
    onError: (error) => {
      // 에러 메시지 추출
      const message = extractApiErrorMessage(
        error,
        "닉네임 수정에 실패했습니다."
      );
      throw new Error(message);
    },
  });
};
