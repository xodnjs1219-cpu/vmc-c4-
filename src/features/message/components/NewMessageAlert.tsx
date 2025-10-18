'use client';

import { useChatRoomContext } from '../context/ChatRoomProvider';
import { Button } from '@/components/ui/button';

export const NewMessageAlert: React.FC = () => {
  const { state, scrollToBottom } = useChatRoomContext();

  if (!state.showNewMessageAlert) {
    return null;
  }

  return (
    <div className="flex justify-center px-4 py-2">
      <Button
        onClick={scrollToBottom}
        variant="outline"
        size="sm"
        className="text-xs"
      >
        새 메시지 ↓
      </Button>
    </div>
  );
};
