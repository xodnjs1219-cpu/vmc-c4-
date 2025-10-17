"use client";

import { useRouter } from "next/navigation";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyRoomState() {
  const router = useRouter();

  const handleCreateRoom = () => {
    router.push("/create-chatroom");
  };

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
      <MessageSquarePlus className="mb-4 h-16 w-16 text-slate-400" />
      <h3 className="mb-2 text-lg font-semibold text-slate-900">
        아직 생성된 채팅방이 없습니다
      </h3>
      <p className="mb-6 text-sm text-slate-600">
        첫 번째 채팅방을 만들어 대화를 시작해보세요!
      </p>
      <Button onClick={handleCreateRoom} className="gap-2">
        <MessageSquarePlus className="h-4 w-4" />
        새 채팅방 만들기
      </Button>
    </div>
  );
}
