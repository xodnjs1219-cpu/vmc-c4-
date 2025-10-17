"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/remote/api-client";
import { useAuthStore } from "@/features/auth/store/auth-store";
import type { LoginFormData } from "@/features/auth/lib/login-schema";

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  user: {
    id: string;
    email: string;
    nickname: string;
    createdAt: string;
  };
  token: string;
};

type LoginErrorPayload = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

type LoginErrorDetail = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export const useLogin = () => {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  return useMutation<LoginResponse, LoginErrorDetail, LoginRequest>({
    mutationFn: async (data) => {
      try {
        const response = await apiClient.post<LoginResponse>(
          "/api/auth/login",
          data,
        );
        return response.data;
      } catch (error: unknown) {
        // axios 에러 처리
        if (
          error &&
          typeof error === "object" &&
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "data" in error.response
        ) {
          const errorData = error.response.data as LoginErrorPayload;
          throw errorData;
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      // 1. 인증 상태 저장
      setAuth(data.user, data.token);

      // 2. 홈 페이지로 리디렉션
      router.push("/");
    },
  });
};
