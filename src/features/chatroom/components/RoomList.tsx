"use client";

import { useRooms } from "@/features/chatroom/hooks/useRooms";
import { useRealtimeRooms } from "@/features/chatroom/hooks/useRealtimeRooms";
import { RoomItem } from "./RoomItem";
import { EmptyRoomState } from "./EmptyRoomState";
import { ErrorRoomState } from "./ErrorRoomState";
import { RoomListSkeleton } from "./RoomListSkeleton";

export function RoomList() {
  const { data: rooms, isLoading, isError, error, refetch } = useRooms();

  // 실시간 동기화 활성화
  useRealtimeRooms();

  // 로딩 상태
  if (isLoading) {
    return <RoomListSkeleton />;
  }

  // 에러 상태
  if (isError) {
    return <ErrorRoomState error={error} onRetryAction={refetch} />;
  }

  // 빈 목록
  if (!rooms || rooms.length === 0) {
    return <EmptyRoomState />;
  }

  // 채팅방 목록
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-900">
        채팅방 목록 ({rooms.length})
      </h2>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <RoomItem key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
}
