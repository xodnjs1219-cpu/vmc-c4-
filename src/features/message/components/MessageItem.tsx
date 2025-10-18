'use client';

import { useChatRoomContext } from '../context/ChatRoomProvider';
import { actions } from '../context/actions';
import type { Message } from '../backend/schema';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

interface MessageItemProps {
  message: Message & { tempId?: string; status?: string };
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { dispatch, toggleLike, currentUser } = useChatRoomContext();

  const isOwnMessage = message.userId === currentUser?.id;
  const canDelete = isOwnMessage && !message.isDeleted;

  const handleReplyClick = () => {
    dispatch(actions.startReply(message as Message));
  };

  const handleDeleteClick = () => {
    dispatch(actions.startDeleting(message.id));
  };

  const handleLikeClick = async () => {
    await toggleLike(message.id, message.isLikedByMe);
  };

  if (message.isDeleted) {
    return (
      <div className="py-2 text-center">
        <span className="text-sm italic text-gray-400">삭제된 메시지입니다</span>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className="flex-1">
        {/* 답장 프리뷰 */}
        {message.replyToMessage && (
          <div className="mb-2 border-l-2 border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-600">
            <div className="font-medium">{message.replyToMessage.authorNickname}</div>
            <div className="truncate text-gray-500">
              {message.replyToMessage.isDeleted
                ? '삭제된 메시지입니다'
                : message.replyToMessage.content}
            </div>
          </div>
        )}

        {/* 메시지 헤더 */}
        <div className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
          <div className="flex-1">
            <div className="text-xs font-semibold text-gray-700">
              {message.authorNickname}
            </div>
            <div className="mt-1 rounded-lg bg-gray-100 px-3 py-2">
              <p className="text-sm text-gray-900">{message.content}</p>
            </div>
          </div>
        </div>

        {/* 메시지 푸터 */}
        <div
          className={`mt-1 flex gap-2 text-xs text-gray-500 ${
            isOwnMessage ? 'flex-row-reverse' : ''
          }`}
        >
          <span>
            {formatDistanceToNow(new Date(message.createdAt), { locale: ko })}
          </span>
          {message.status === 'sending' && <span>전송 중...</span>}
          {message.status === 'failed' && <span>전송 실패</span>}
        </div>

        {/* 액션 버튼 */}
        <div
          className={`mt-2 flex gap-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLikeClick}
            className="h-6 text-xs"
          >
            {message.isLikedByMe ? '❤️' : '🤍'} {message.likeCount > 0 && message.likeCount}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReplyClick}
            className="h-6 text-xs"
          >
            답장
          </Button>
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              className="h-6 text-xs"
            >
              삭제
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
