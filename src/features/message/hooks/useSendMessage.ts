'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Dispatch } from 'react';
import { apiClient } from '@/lib/remote/api-client';
import type { Message } from '../backend/schema';
import { actions } from '../context/actions';
import type { ChatRoomAction, ChatRoomState } from '../context/reducer';

interface UseSendMessageProps {
  roomId: string;
  state: ChatRoomState;
  dispatch: Dispatch<ChatRoomAction>;
  currentUser: { id: string; nickname: string } | undefined;
}

export function useSendMessage({
  roomId,
  state,
  dispatch,
  currentUser,
}: UseSendMessageProps) {
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async (data: {
      content: string;
      replyToMessageId?: string;
    }) => {
      const response = await apiClient.post<Message>('/api/messages', {
        roomId,
        content: data.content,
        type: 'text',
        replyToMessageId: data.replyToMessageId,
      });
      return response.data;
    },
    onSuccess: (newMessage) => {
      // 성공 시 캐시에 새 메시지 추가
      queryClient.setQueryData<Message[]>(['messages', roomId], (old = []) => {
        // 중복 체크 (이미 있으면 추가하지 않음)
        if (old.some((msg) => msg.id === newMessage.id)) {
          return old;
        }
        return [...old, newMessage];
      });
    },
  });

  const sendMessage = async () => {
    if (
      !state.messageInput.trim() ||
      state.messageInput.length > 1000 ||
      !currentUser
    ) {
      return;
    }

    // 1. 낙관적 업데이트
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message & {
      tempId: string;
      status: 'sending' | 'sent' | 'failed';
    } = {
      tempId,
      id: '',
      content: state.messageInput,
      messageType: 'text',
      userId: currentUser.id,
      authorNickname: currentUser.nickname,
      chatRoomId: roomId,
      replyToMessageId: state.replyingTo?.id || null,
      replyToMessage: state.replyingTo || null,
      likeCount: 0,
      isLikedByMe: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };

    dispatch(actions.addOptimisticMessage(optimisticMsg));

    const content = state.messageInput;
    const replyToMessageId = state.replyingTo?.id;

    dispatch(actions.clearMessageInput());
    dispatch(actions.cancelReply());

    // 2. API 요청
    try {
      await sendMessageMutation.mutateAsync({ content, replyToMessageId });
      // 성공 시 낙관적 메시지 제거 (서버 메시지는 캐시에 추가됨)
      dispatch(actions.removeOptimisticMessage(tempId));
    } catch (error: any) {
      // 실패 시 실패 목록으로 이동
      dispatch(
        actions.markMessageFailed(tempId, error.message || '전송에 실패했습니다')
      );
    }
  };

  return { sendMessage, isSending: sendMessageMutation.isPending };
}
