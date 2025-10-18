import { useQuery } from "@tanstack/react-query";
import { apiClient, extractApiErrorMessage } from "@/lib/remote/api-client";

type User = {
  id: string;
  email: string;
  nickname: string;
  createdAt: string;
};

export const useCurrentUser = () => {
  return useQuery<User, Error>({
    queryKey: ["user", "me"],
    queryFn: async () => {
      try {
        const response = await apiClient.get<User>("/api/users/me");
        const user = response.data;
        
        if (!user || !user.id) {
          throw new Error("사용자 정보가 올바르지 않습니다");
        }
        
        return user;
      } catch (error) {
        const message = extractApiErrorMessage(
          error,
          "사용자 정보를 불러올 수 없습니다"
        );
        throw new Error(message);
      }
    },
    staleTime: 5 * 60 * 1000, // 5분
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
