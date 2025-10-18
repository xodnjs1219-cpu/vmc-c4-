'use client';

import { useChatRoomContext } from '../context/ChatRoomProvider';
import { Button } from '@/components/ui/button';

export const ChatRoomHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between border-b bg-white p-4 shadow-sm">
      <div>
        <h1 className="text-lg font-semibold">채팅방</h1>
        <p className="text-sm text-gray-500">실시간 채팅</p>
      </div>
      <Button variant="ghost" size="icon">
        ⋮
      </Button>
    </div>
  );
};
