'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { Message } from '../backend/schema';

interface UseMessagesParams {
  roomId: string;
  enabled?: boolean;
}

export const useMessages = ({ roomId, enabled = true }: UseMessagesParams) => {
  return useQuery({
    queryKey: ['messages', roomId],
    queryFn: async () => {
      const response = await apiClient.get<Message[]>(
        `/api/rooms/${roomId}/messages`
      );

      // 백엔드가 배열을 직접 반환함
      return response.data;
    },
    enabled,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60, // 1분
  });
};
