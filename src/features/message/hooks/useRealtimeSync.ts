'use client';

import { useEffect } from 'react';
import type { Dispatch } from 'react';
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
        (payload) => {
          // 새 메시지 수신
          const newMessage = payload.new as Message;
          // 실시간으로 수신한 메시지는 별도 처리 (Realtime으로 타임라인 업데이트)
          dispatch(actions.showNewMessageAlert());
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `chat_room_id=eq.${roomId}`,
        },
        (payload) => {
          // 메시지 업데이트 (삭제 등)
          const updatedMessage = payload.new as Message;
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
  }, [roomId, dispatch]);
}
