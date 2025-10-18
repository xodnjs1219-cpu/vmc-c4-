"use client";

import { CreateChatroomForm } from "@/features/chatroom/components/CreateChatroomForm";

type CreateRoomPageProps = {
  params: Promise<Record<string, unknown>>;
};

export default function CreateRoomPage({ params }: CreateRoomPageProps) {
  void params;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-8 px-6 py-16">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-semibold">새 채팅방 만들기</h1>
        <p className="text-slate-500">
          채팅방 이름을 입력하여 새로운 대화 공간을 만들어보세요.
        </p>
      </header>
      <div className="w-full">
        <CreateChatroomForm />
      </div>
    </div>
  );
}
