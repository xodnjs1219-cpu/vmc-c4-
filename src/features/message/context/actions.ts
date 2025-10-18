import type { Message } from '../backend/schema';
import type {
  ConnectionStatus,
  OptimisticMessage,
  FailedMessage,
} from './reducer';

export const actions = {
  setMessageInput: (text: string) => ({
    type: 'SET_MESSAGE_INPUT' as const,
    payload: text,
  }),
  clearMessageInput: () => ({ type: 'CLEAR_MESSAGE_INPUT' as const }),
  startReply: (message: Message) => ({
    type: 'START_REPLY' as const,
    payload: message,
  }),
  cancelReply: () => ({ type: 'CANCEL_REPLY' as const }),
  addOptimisticMessage: (message: OptimisticMessage) => ({
    type: 'ADD_OPTIMISTIC_MESSAGE' as const,
    payload: message,
  }),
  removeOptimisticMessage: (tempId: string) => ({
    type: 'REMOVE_OPTIMISTIC_MESSAGE' as const,
    payload: { tempId },
  }),
  markMessageFailed: (tempId: string, error: string) => ({
    type: 'MARK_MESSAGE_FAILED' as const,
    payload: { tempId, error },
  }),
  addFailedMessage: (message: FailedMessage) => ({
    type: 'ADD_FAILED_MESSAGE' as const,
    payload: message,
  }),
  removeFailedMessage: (tempId: string) => ({
    type: 'REMOVE_FAILED_MESSAGE' as const,
    payload: { tempId },
  }),
  setConnectionStatus: (status: ConnectionStatus) => ({
    type: 'SET_CONNECTION_STATUS' as const,
    payload: status,
  }),
  setScrolledToBottom: (isBottom: boolean) => ({
    type: 'SET_SCROLLED_TO_BOTTOM' as const,
    payload: isBottom,
  }),
  showNewMessageAlert: () => ({ type: 'SHOW_NEW_MESSAGE_ALERT' as const }),
  hideNewMessageAlert: () => ({ type: 'HIDE_NEW_MESSAGE_ALERT' as const }),
  startDeleting: (messageId: string) => ({
    type: 'START_DELETING' as const,
    payload: { messageId },
  }),
  cancelDeleting: () => ({ type: 'CANCEL_DELETING' as const }),
  resetState: () => ({ type: 'RESET_STATE' as const }),
};
