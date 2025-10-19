"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/remote/api-client";

type ForgotPasswordRequest = {
  email: string;
};

type ForgotPasswordResponse = {
  message: string;
};

type ForgotPasswordErrorPayload = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

type ForgotPasswordErrorDetail = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export const useForgotPassword = () => {
  return useMutation<ForgotPasswordResponse, ForgotPasswordErrorDetail, ForgotPasswordRequest>({
    mutationFn: async (data) => {
      try {
        const response = await apiClient.post<ForgotPasswordResponse>(
          "/api/auth/forgot-password",
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
          const errorData = error.response.data as ForgotPasswordErrorPayload;
          throw errorData;
        }
        throw error;
      }
    },
  });
};
