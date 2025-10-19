"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/remote/api-client";

type ResetPasswordRequest = {
  token: string;
  password: string;
  passwordConfirm: string;
};

type ResetPasswordResponse = {
  message: string;
};

type ResetPasswordErrorPayload = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

type ResetPasswordErrorDetail = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export const useResetPassword = () => {
  const router = useRouter();

  return useMutation<ResetPasswordResponse, ResetPasswordErrorDetail, ResetPasswordRequest>({
    mutationFn: async (data) => {
      try {
        const response = await apiClient.post<ResetPasswordResponse>(
          "/api/auth/reset-password",
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
          const errorData = error.response.data as ResetPasswordErrorPayload;
          throw errorData;
        }
        throw error;
      }
    },
    onSuccess: () => {
      // 로그인 페이지로 리디렉션
      router.push("/login");
    },
  });
};
