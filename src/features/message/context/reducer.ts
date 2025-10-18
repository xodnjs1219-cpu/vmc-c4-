import type { Message } from '../backend/schema';

export type ConnectionStatus =
  | 'connected'
  | 'disconnected'
  | 'reconnecting';

export interface OptimisticMessage extends Message {
  tempId: string;
  status: 'sending' | 'sent' | 'failed';
}

export interface FailedMessage {
  tempId: string;
  content: string;
  replyToMessageId?: string;
  error: string;
}

export interface ChatRoomState {
  messageInput: string;
  replyingTo: Message | null;
  isComposing: boolean;
  optimisticMessages: OptimisticMessage[];
  failedMessages: FailedMessage[];
  connectionStatus: ConnectionStatus;
  isScrolledToBottom: boolean;
  showNewMessageAlert: boolean;
  deletingMessageId: string | null;
}

export const initialState: ChatRoomState = {
  messageInput: '',
  replyingTo: null,
  isComposing: false,
  optimisticMessages: [],
  failedMessages: [],
  connectionStatus: 'disconnected',
  isScrolledToBottom: true,
  showNewMessageAlert: false,
  deletingMessageId: null,
};

export type ChatRoomAction =
  | { type: 'SET_MESSAGE_INPUT'; payload: string }
  | { type: 'CLEAR_MESSAGE_INPUT' }
  | { type: 'START_REPLY'; payload: Message }
  | { type: 'CANCEL_REPLY' }
  | { type: 'ADD_OPTIMISTIC_MESSAGE'; payload: OptimisticMessage }
  | { type: 'REMOVE_OPTIMISTIC_MESSAGE'; payload: { tempId: string } }
  | { type: 'MARK_MESSAGE_FAILED'; payload: { tempId: string; error: string } }
  | { type: 'ADD_FAILED_MESSAGE'; payload: FailedMessage }
  | { type: 'REMOVE_FAILED_MESSAGE'; payload: { tempId: string } }
  | { type: 'SET_CONNECTION_STATUS'; payload: ConnectionStatus }
  | { type: 'SET_SCROLLED_TO_BOTTOM'; payload: boolean }
  | { type: 'SHOW_NEW_MESSAGE_ALERT' }
  | { type: 'HIDE_NEW_MESSAGE_ALERT' }
  | { type: 'START_DELETING'; payload: { messageId: string } }
  | { type: 'CANCEL_DELETING' }
  | { type: 'RESET_STATE' };

export function chatRoomReducer(
  state: ChatRoomState,
  action: ChatRoomAction
): ChatRoomState {
  switch (action.type) {
    case 'SET_MESSAGE_INPUT':
      return {
        ...state,
        messageInput: action.payload,
        isComposing: action.payload.trim().length > 0,
      };

    case 'CLEAR_MESSAGE_INPUT':
      return {
        ...state,
        messageInput: '',
        isComposing: false,
      };

    case 'START_REPLY':
      return {
        ...state,
        replyingTo: action.payload,
      };

    case 'CANCEL_REPLY':
      return {
        ...state,
        replyingTo: null,
      };

    case 'ADD_OPTIMISTIC_MESSAGE':
      return {
        ...state,
        optimisticMessages: [...state.optimisticMessages, action.payload],
      };

    case 'REMOVE_OPTIMISTIC_MESSAGE':
      return {
        ...state,
        optimisticMessages: state.optimisticMessages.filter(
          (msg) => msg.tempId !== action.payload.tempId
        ),
      };

    case 'MARK_MESSAGE_FAILED': {
      const failedMsg = state.optimisticMessages.find(
        (msg) => msg.tempId === action.payload.tempId
      );
      if (!failedMsg) return state;

      return {
        ...state,
        optimisticMessages: state.optimisticMessages.filter(
          (msg) => msg.tempId !== action.payload.tempId
        ),
        failedMessages: [
          ...state.failedMessages,
          {
            tempId: failedMsg.tempId,
            content: failedMsg.content,
            replyToMessageId: failedMsg.replyToMessageId || undefined,
            error: action.payload.error,
          },
        ],
      };
    }

    case 'ADD_FAILED_MESSAGE':
      return {
        ...state,
        failedMessages: [...state.failedMessages, action.payload],
      };

    case 'REMOVE_FAILED_MESSAGE':
      return {
        ...state,
        failedMessages: state.failedMessages.filter(
          (msg) => msg.tempId !== action.payload.tempId
        ),
      };

    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        connectionStatus: action.payload,
      };

    case 'SET_SCROLLED_TO_BOTTOM':
      return {
        ...state,
        isScrolledToBottom: action.payload,
        showNewMessageAlert: action.payload
          ? false
          : state.showNewMessageAlert,
      };

    case 'SHOW_NEW_MESSAGE_ALERT':
      return {
        ...state,
        showNewMessageAlert: !state.isScrolledToBottom,
      };

    case 'HIDE_NEW_MESSAGE_ALERT':
      return {
        ...state,
        showNewMessageAlert: false,
      };

    case 'START_DELETING':
      return {
        ...state,
        deletingMessageId: action.payload.messageId,
      };

    case 'CANCEL_DELETING':
      return {
        ...state,
        deletingMessageId: null,
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}
