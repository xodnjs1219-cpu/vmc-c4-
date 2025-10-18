'use client';

import { use } from 'react';
import { ChatRoomProvider } from '@/features/message/context/ChatRoomProvider';
import { ChatRoomHeader } from '@/features/message/components/ChatRoomHeader';
import { ConnectionStatusBanner } from '@/features/message/components/ConnectionStatusBanner';
import { MessageTimeline } from '@/features/message/components/MessageTimeline';
import { NewMessageAlert } from '@/features/message/components/NewMessageAlert';
import { MessageInput } from '@/features/message/components/MessageInput';
import { DeleteConfirmDialog } from '@/features/message/components/DeleteConfirmDialog';

export default function ChatRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);

  return (
    <ChatRoomProvider roomId={roomId}>
      <div className="flex min-h-screen flex-col">
        <ChatRoomHeader />
        <ConnectionStatusBanner />
        <MessageTimeline />
        <NewMessageAlert />
        <MessageInput />
        <DeleteConfirmDialog />
      </div>
    </ChatRoomProvider>
  );
}
