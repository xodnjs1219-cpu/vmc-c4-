'use client';

import { useChatRoomContext } from '../context/ChatRoomProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageItem } from '@/features/message/components/MessageItem';

export const MessageTimeline: React.FC = () => {
  const { mergedMessages, state, dispatch, loadMoreMessages, hasMoreMessages, timelineRef } =
    useChatRoomContext();

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    dispatch({ type: 'SET_SCROLLED_TO_BOTTOM', payload: isBottom });

    // 스크롤 상단 도달 시 추가 로드
    if (target.scrollTop < 100 && hasMoreMessages) {
      loadMoreMessages();
    }
  };

  return (
    <div
      ref={timelineRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto bg-slate-100 py-3"
    >
      {mergedMessages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-gray-500">아직 메시지가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-2">
          {mergedMessages.map((message, index) => (
            <MessageItem
              key={message.id || `temp-${index}`}
              message={message}
            />
          ))}
        </div>
      )}
    </div>
  );
};
