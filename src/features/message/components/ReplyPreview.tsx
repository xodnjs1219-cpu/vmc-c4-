'use client';

import { useChatRoomContext } from '../context/ChatRoomProvider';
import { actions } from '../context/actions';
import type { Message } from '../backend/schema';

interface ReplyPreviewProps {
  message: Message;
  onCancel?: () => void;
}

export const ReplyPreview: React.FC<ReplyPreviewProps> = ({ message, onCancel }) => {
  const { state, dispatch } = useChatRoomContext();

  const handleCancel = () => {
    dispatch(actions.cancelReply());
    onCancel?.();
  };

  return (
    <div className="mb-2 border-l-4 border-blue-500 bg-blue-50 px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 text-xs">
          <div className="font-medium text-blue-900">
            {message.authorNickname}에게 답장
          </div>
          <div className="truncate text-blue-700">
            {message.content.substring(0, 50)}
            {message.content.length > 50 ? '...' : ''}
          </div>
        </div>
        <button
          onClick={handleCancel}
          className="text-blue-500 hover:text-blue-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
