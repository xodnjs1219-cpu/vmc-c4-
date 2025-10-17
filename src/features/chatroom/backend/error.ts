export const roomErrorCodes = {
  roomsFetchError: "ROOMS_FETCH_ERROR",
  roomNotFound: "ROOM_NOT_FOUND",
  roomDeleted: "ROOM_DELETED",
} as const;

type RoomErrorValue = (typeof roomErrorCodes)[keyof typeof roomErrorCodes];

export type RoomServiceError = RoomErrorValue;
