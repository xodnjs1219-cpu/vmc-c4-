'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Dispatch } from 'react';
import { apiClient } from '@/lib/remote/api-client';
import { actions } from '../context/actions';
import type { ChatRoomAction } from '../context/reducer';
import type { Message } from '../backend/schema';

interface UseDeleteMessageProps {
  roomId: string;
  dispatch: Dispatch<ChatRoomAction>;
}

export function useDeleteMessage({ roomId, dispatch }: UseDeleteMessageProps) {
  const queryClient = useQueryClient();

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await apiClient.delete(`/api/messages/${messageId}`);
      return messageId;
    },
    onSuccess: (deletedMessageId) => {
      // 캐시에서 삭제된 메시지 제거
      queryClient.setQueryData<Message[]>(['messages', roomId], (old = []) => {
        return old.filter((msg) => msg.id !== deletedMessageId);
      });
      dispatch(actions.cancelDeleting());
    },
  });

  const deleteMessage = async (messageId: string) => {
    try {
      await deleteMessageMutation.mutateAsync(messageId);
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  return { deleteMessage, isDeleting: deleteMessageMutation.isPending };
}
