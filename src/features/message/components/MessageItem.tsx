'use client';

import { useState } from 'react';
import { useChatRoomContext } from '../context/ChatRoomProvider';
import { actions } from '../context/actions';
import type { Message } from '../backend/schema';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MessageItemProps {
  message: Message & { tempId?: string; status?: string };
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { dispatch, toggleLike, currentUser } = useChatRoomContext();
  const [showActions, setShowActions] = useState(false);

  const isOwnMessage = message.userId === currentUser?.id;
  const canDelete = isOwnMessage && !message.isDeleted;

  const handleReplyClick = () => {
    dispatch(actions.startReply(message as Message));
    setShowActions(false);
  };

  const handleDeleteClick = () => {
    dispatch(actions.startDeleting(message.id));
    setShowActions(false);
  };

  const handleLikeClick = async () => {
    await toggleLike(message.id, message.isLikedByMe);
  };

  if (message.isDeleted) {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs text-gray-400">삭제된 메시지입니다</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-2 px-4 py-1',
        isOwnMessage ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* 프로필 영역 (상대 메시지만) */}
      {!isOwnMessage && (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-sm font-semibold text-white">
          {message.authorNickname.slice(0, 2)}
        </div>
      )}

      {/* 메시지 영역 */}
      <div className={cn('flex max-w-[70%] flex-col gap-1')}>
        {/* 닉네임 (상대 메시지만) */}
        {!isOwnMessage && (
          <div className="px-1 text-xs font-medium text-gray-700">
            {message.authorNickname}
          </div>
        )}

        {/* 답장 프리뷰 */}
        {message.replyToMessage && message.replyToMessage.id && (
          <div
            className={cn(
              'mb-1 rounded-lg border-l-4 bg-gray-100/50 px-3 py-2 text-xs',
              isOwnMessage ? 'border-yellow-500' : 'border-blue-500'
            )}
          >
            <div className="font-semibold text-gray-700">
              {message.replyToMessage.authorNickname}
            </div>
            <div className="mt-0.5 text-gray-600">
              {message.replyToMessage.isDeleted
                ? '삭제된 메시지입니다'
                : message.replyToMessage.content}
            </div>
          </div>
        )}

        {/* 메시지 내용과 시간 */}
        <div className={cn('flex items-end gap-2', isOwnMessage && 'flex-row-reverse')}>
          {/* 말풍선 */}
          <div
            className={cn(
              'group relative rounded-2xl px-4 py-2.5 shadow-sm',
              isOwnMessage
                ? 'bg-yellow-400 text-gray-900'
                : 'bg-white text-gray-900',
              'cursor-pointer transition-shadow hover:shadow-md'
            )}
            onClick={() => setShowActions(!showActions)}
          >
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {message.content}
            </p>
          </div>

          {/* 시간 및 상태 */}
          <div className="flex flex-col items-end justify-end gap-0.5 pb-0.5">
            <span className="text-[10px] text-gray-500">
              {format(new Date(message.createdAt), 'a h:mm', { locale: ko })}
            </span>
            {message.status === 'sending' && (
              <span className="text-[10px] text-yellow-600">전송중</span>
            )}
            {message.status === 'failed' && (
              <span className="text-[10px] text-red-600">실패</span>
            )}
          </div>
        </div>

        {/* 좋아요 표시 */}
        {message.likeCount > 0 && (
          <button
            onClick={handleLikeClick}
            className={cn(
              'flex w-fit items-center gap-1 rounded-full border bg-white px-2 py-0.5 text-xs shadow-sm transition-all hover:scale-105',
              isOwnMessage && 'self-end',
              message.isLikedByMe && 'border-red-300 bg-red-50'
            )}
          >
            <span>{message.isLikedByMe ? '❤️' : '🤍'}</span>
            <span className="text-gray-700">{message.likeCount}</span>
          </button>
        )}

        {/* 액션 버튼 (토글) */}
        {showActions && (
          <div
            className={cn(
              'flex gap-1',
              isOwnMessage ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {message.likeCount === 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLikeClick}
                className="h-7 text-xs hover:bg-gray-100"
              >
                {message.isLikedByMe ? '❤️' : '🤍'} 좋아요
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReplyClick}
              className="h-7 text-xs hover:bg-gray-100"
            >
              💬 답장
            </Button>
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                className="h-7 text-xs text-red-600 hover:bg-red-50"
              >
                🗑️ 삭제
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
