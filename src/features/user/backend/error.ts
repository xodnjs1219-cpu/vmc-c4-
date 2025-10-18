export const userErrorCodes = {
  userNotFound: "USER_NOT_FOUND",
  userFetchError: "USER_FETCH_ERROR",
  nicknameDuplicate: "NICKNAME_DUPLICATE",
  nicknameSame: "NICKNAME_SAME",
  nicknameUpdateError: "NICKNAME_UPDATE_ERROR",
} as const;

type UserErrorValue = (typeof userErrorCodes)[keyof typeof userErrorCodes];

export type UserServiceError = UserErrorValue;
