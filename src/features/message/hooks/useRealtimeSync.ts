'use client';

import { useEffect } from 'react';
import type { Dispatch } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import type { Message } from '../backend/schema';
import { actions } from '../context/actions';
import type { ChatRoomAction } from '../context/reducer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function useRealtimeSync(
  roomId: string,
  dispatch: Dispatch<ChatRoomAction>
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase not configured');
      return;
    }

    dispatch(actions.setConnectionStatus('disconnected'));

    const supabase = createClient(supabaseUrl, supabaseKey);

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_room_id=eq.${roomId}`,
        },
        async (payload) => {
          console.log('[Realtime] New message received:', payload.new);
          
          // 메시지 상세 정보를 다시 조회 (JOIN된 데이터 포함)
          const { data: messageWithDetails } = await supabase
            .from('messages')
            .select(`
              id,
              chat_room_id,
              user_id,
              content,
              message_type,
              reply_to_message_id,
              is_deleted,
              created_at,
              users!user_id (
                nickname
              ),
              message_likes (
                user_id
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (messageWithDetails) {
            // 캐시에 새 메시지 추가
            queryClient.setQueryData<Message[]>(['messages', roomId], (old = []) => {
              // 중복 체크
              if (old.some((msg) => msg.id === messageWithDetails.id)) {
                return old;
              }

              const newMessage: Message = {
                id: messageWithDetails.id,
                chatRoomId: messageWithDetails.chat_room_id,
                userId: messageWithDetails.user_id,
                authorNickname: (messageWithDetails.users as any)?.nickname || '알 수 없음',
                content: messageWithDetails.content,
                messageType: messageWithDetails.message_type,
                replyToMessageId: messageWithDetails.reply_to_message_id,
                replyToMessage: undefined,
                likeCount: messageWithDetails.message_likes?.length || 0,
                isLikedByMe: false,
                isDeleted: messageWithDetails.is_deleted,
                createdAt: messageWithDetails.created_at,
              };

              return [...old, newMessage];
            });

            dispatch(actions.showNewMessageAlert());
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `chat_room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log('[Realtime] Message deleted:', payload.old);
          
          // 캐시에서 삭제된 메시지 제거
          queryClient.setQueryData<Message[]>(['messages', roomId], (old = []) => {
            return old.filter((msg) => msg.id !== payload.old.id);
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'message_likes',
          filter: `message_id=in.(${roomId})`,
        },
        (payload) => {
          console.log('[Realtime] Like updated:', payload);
          // 좋아요 변경 시 메시지 목록 다시 조회
          queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          dispatch(actions.setConnectionStatus('connected'));
        } else if (status === 'CHANNEL_ERROR') {
          dispatch(actions.setConnectionStatus('disconnected'));
          // 재연결 시도
          setTimeout(() => {
            dispatch(actions.setConnectionStatus('reconnecting'));
            channel.subscribe();
          }, 1000);
        }
      });

    return () => {
      channel.unsubscribe();
      dispatch(actions.setConnectionStatus('disconnected'));
    };
  }, [roomId, dispatch, queryClient]);
}
