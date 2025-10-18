"use client";

import { useRouter } from "next/navigation";
import { MessageSquare, User, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Room } from "@/features/chatroom/hooks/useRooms";

type RoomItemProps = {
  room: Room;
};

export function RoomItem({ room }: RoomItemProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/app/room/${room.id}`);
  };

  const timeAgo = formatDistanceToNow(new Date(room.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <Card
      className="cursor-pointer transition-all hover:border-slate-400 hover:shadow-md"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4 text-slate-500" />
          <span className="truncate">{room.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5" />
          <span className="truncate">{room.creatorNickname}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5" />
          <span>{timeAgo}</span>
        </div>
      </CardContent>
    </Card>
  );
}
