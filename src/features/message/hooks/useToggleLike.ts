'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { Message } from '../backend/schema';

interface UseToggleLikeProps {
  roomId: string;
}

export function useToggleLike({ roomId }: UseToggleLikeProps) {
  const queryClient = useQueryClient();

  const toggleLikeMutation = useMutation({
    mutationFn: async ({
      messageId,
      isLiked,
    }: {
      messageId: string;
      isLiked: boolean;
    }) => {
      if (isLiked) {
        await apiClient.delete(`/api/messages/${messageId}/like`);
      } else {
        await apiClient.post(`/api/messages/${messageId}/like`, {});
      }
      return { messageId, isLiked };
    },
    onSuccess: ({ messageId, isLiked }) => {
      // 캐시에서 좋아요 상태 업데이트
      queryClient.setQueryData<Message[]>(['messages', roomId], (old = []) => {
        return old.map((msg) => {
          if (msg.id === messageId) {
            return {
              ...msg,
              isLikedByMe: !isLiked,
              likeCount: isLiked ? msg.likeCount - 1 : msg.likeCount + 1,
            };
          }
          return msg;
        });
      });
    },
  });

  const toggleLike = async (messageId: string, isLiked: boolean) => {
    await toggleLikeMutation.mutateAsync({ messageId, isLiked });
  };

  return { toggleLike, isToggling: toggleLikeMutation.isPending };
}
