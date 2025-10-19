export const authErrorCodes = {
  nicknameDuplicate: "NICKNAME_DUPLICATE",
  emailDuplicate: "EMAIL_DUPLICATE",
  signupFetchError: "SIGNUP_FETCH_ERROR",
  passwordHashError: "PASSWORD_HASH_ERROR",
  invalidCredentials: "INVALID_CREDENTIALS",
  loginFetchError: "LOGIN_FETCH_ERROR",
  authFailed: "AUTH_FAILED",
  passwordCompareError: "PASSWORD_COMPARE_ERROR",
  tokenGenerationError: "TOKEN_GENERATION_ERROR",
  userNotFound: "USER_NOT_FOUND",
  emailSendError: "EMAIL_SEND_ERROR",
  invalidToken: "INVALID_TOKEN",
  expiredToken: "EXPIRED_TOKEN",
  passwordUpdateError: "PASSWORD_UPDATE_ERROR",
} as const;

type AuthErrorValue = (typeof authErrorCodes)[keyof typeof authErrorCodes];

export type AuthServiceError = AuthErrorValue;
