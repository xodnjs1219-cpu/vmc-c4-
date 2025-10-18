'use client';

import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import {
  chatRoomReducer,
  initialState,
  type ChatRoomState,
  type ChatRoomAction,
} from './reducer';
import { actions } from './actions';
import type { Message } from '../backend/schema';
import { useSendMessage } from '../hooks/useSendMessage';
import { useDeleteMessage } from '../hooks/useDeleteMessage';
import { useToggleLike } from '../hooks/useToggleLike';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { useMessages } from '../hooks/useMessages';
import { useAuthStore } from '@/features/auth/store/auth-store';

interface ChatRoomContextValue {
  state: ChatRoomState;
  dispatch: React.Dispatch<ChatRoomAction>;
  messages: Message[];
  currentUser: { id: string; nickname: string } | undefined;
  hasMoreMessages: boolean;
  canSendMessage: boolean;
  showCharCounter: boolean;
  mergedMessages: Message[];
  sendMessage: () => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  toggleLike: (messageId: string, isLiked: boolean) => Promise<void>;
  loadMoreMessages: () => void;
  retryFailedMessage: (tempId: string) => void;
  scrollToBottom: () => void;
  timelineRef: React.RefObject<HTMLDivElement>;
}

const ChatRoomContext = createContext<ChatRoomContextValue | null>(null);

export const useChatRoomContext = () => {
  const context = useContext(ChatRoomContext);
  if (!context) {
    throw new Error(
      'useChatRoomContext must be used within ChatRoomProvider'
    );
  }
  return context;
};

interface ChatRoomProviderProps {
  roomId: string;
  children: ReactNode;
}

export const ChatRoomProvider: React.FC<ChatRoomProviderProps> = ({
  roomId,
  children,
}) => {
  const [state, dispatch] = useReducer(chatRoomReducer, initialState);
  const timelineRef = useRef<HTMLDivElement>(null);

  // 인증 상태에서 사용자 정보 가져오기
  const authUser = useAuthStore((state) => state.user);
  const currentUser = authUser
    ? { id: authUser.id, nickname: authUser.nickname }
    : undefined;

  // 메시지 목록 가져오기
  const { data: messages = [], isLoading } = useMessages({
    roomId,
    enabled: !!currentUser,
  });

  const hasMoreMessages = false;
  const fetchNextPage = () => {};

  const { sendMessage } = useSendMessage({
    roomId,
    state,
    dispatch,
    currentUser,
  });
  const { deleteMessage } = useDeleteMessage({ roomId, dispatch });
  const { toggleLike } = useToggleLike({ roomId });

  useRealtimeSync(roomId, dispatch);

  const canSendMessage = useMemo(
    () =>
      state.messageInput.trim().length > 0 &&
      state.messageInput.length <= 1000 &&
      state.connectionStatus === 'connected',
    [state.messageInput, state.connectionStatus]
  );

  const showCharCounter = useMemo(
    () => state.messageInput.length >= 900,
    [state.messageInput.length]
  );

  const mergedMessages = useMemo(() => {
    const tempMessages = state.optimisticMessages.filter(
      (m) => m.status !== 'failed'
    );
    const allMessages = [...tempMessages, ...messages];

    const uniqueMessages = allMessages.filter(
      (msg, index, self) =>
        index ===
        self.findIndex(
          (m) =>
            m.id === msg.id ||
            ('tempId' in m && 'tempId' in msg && m.tempId === msg.tempId)
        )
    );

    return uniqueMessages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [state.optimisticMessages, messages]);

  const loadMoreMessages = useCallback(() => {
    if (hasMoreMessages) {
      fetchNextPage();
    }
  }, [hasMoreMessages, fetchNextPage]);

  const retryFailedMessage = useCallback(
    (tempId: string) => {
      const failedMsg = state.failedMessages.find((m) => m.tempId === tempId);
      if (!failedMsg) return;

      dispatch(actions.removeFailedMessage(tempId));
      dispatch(actions.setMessageInput(failedMsg.content));
    },
    [state.failedMessages]
  );

  const scrollToBottom = useCallback(() => {
    timelineRef.current?.scrollTo({
      top: timelineRef.current.scrollHeight,
      behavior: 'smooth',
    });
    dispatch(actions.hideNewMessageAlert());
  }, []);

  useEffect(() => {
    return () => {
      dispatch(actions.resetState());
    };
  }, [roomId]);

  const contextValue: ChatRoomContextValue = {
    state,
    dispatch,
    messages,
    currentUser,
    hasMoreMessages,
    canSendMessage,
    showCharCounter,
    mergedMessages,
    sendMessage,
    deleteMessage,
    toggleLike,
    loadMoreMessages,
    retryFailedMessage,
    scrollToBottom,
    timelineRef,
  };

  return (
    <ChatRoomContext.Provider value={contextValue}>
      {children}
    </ChatRoomContext.Provider>
  );
};
