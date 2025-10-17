import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/remote/api-client";
import type { SignupFormData } from "@/features/auth/lib/signup-schema";

type SignupRequest = SignupFormData;

type SignupResponse = {
  message: string;
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
      const response = await apiClient.post<SignupResponse>(
        "/api/auth/signup",
        data,
      );
      return response.data;
    },
  });
};
