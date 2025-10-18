export const roomErrorCodes = {
  // 조회 관련
  roomsFetchError: "ROOMS_FETCH_ERROR",
  roomNotFound: "ROOM_NOT_FOUND",
  roomDeleted: "ROOM_DELETED",
  
  // 생성 관련
  roomNameDuplicate: "ROOM_NAME_DUPLICATE",
  roomCreateError: "ROOM_CREATE_ERROR",
  unauthorized: "UNAUTHORIZED",
} as const;

type RoomErrorValue = (typeof roomErrorCodes)[keyof typeof roomErrorCodes];

export type RoomServiceError = RoomErrorValue;
