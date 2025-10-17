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

type LoginError = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  status: number;
};

export const useLogin = () => {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  return useMutation<LoginResponse, LoginError, LoginRequest>({
    mutationFn: async (data) => {
      const response = await apiClient.post<{ ok: true; data: LoginResponse; status: number }>(
        "/api/auth/login",
        data,
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      // 1. 인증 상태 저장
      setAuth(data.user, data.token);

      // 2. 홈 페이지로 리디렉션
      router.push("/");
    },
  });
};
