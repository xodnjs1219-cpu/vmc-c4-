import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/remote/api-client";
import type { SignupFormData } from "@/features/auth/lib/signup-schema";

type SignupRequest = SignupFormData;

type SignupResponse = {
  message: string;
};

type SignupErrorPayload = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

type SignupErrorDetail = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export const useSignup = () => {
  return useMutation<SignupResponse, SignupErrorDetail, SignupRequest>({
    mutationFn: async (data) => {
      try {
        const response = await apiClient.post<SignupResponse>(
          "/api/auth/signup",
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
          const errorData = error.response.data as SignupErrorPayload;
          throw errorData;
        }
        throw error;
      }
    },
  });
};
