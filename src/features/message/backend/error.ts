export const messageErrorCodes = {
  messageCreateError: 'MESSAGE_CREATE_ERROR',
  messageNotFound: 'MESSAGE_NOT_FOUND',
  messageDeleteForbidden: 'MESSAGE_DELETE_FORBIDDEN',
  messageLikeError: 'MESSAGE_LIKE_ERROR',
  unauthorized: 'UNAUTHORIZED',
} as const;

type MessageErrorValue = (typeof messageErrorCodes)[keyof typeof messageErrorCodes];

export type MessageServiceError = MessageErrorValue;
