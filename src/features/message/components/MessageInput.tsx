'use client';

import { useRef, useEffect } from 'react';
import { useChatRoomContext } from '../context/ChatRoomProvider';
import { actions } from '../context/actions';
import { ReplyPreview } from './ReplyPreview';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export const MessageInput: React.FC = () => {
  const {
    state,
    dispatch,
    canSendMessage,
    showCharCounter,
    sendMessage,
  } = useChatRoomContext();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(actions.setMessageInput(e.target.value));
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSendMessage) {
        await sendMessage();
        // 전송 후 입력창에 포커스 유지
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 0);
      }
    }
  };

  const handleSendClick = async () => {
    if (canSendMessage) {
      await sendMessage();
      // 전송 후 입력창에 포커스
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  const handleCancelReply = () => {
    dispatch(actions.cancelReply());
  };

  // 컴포넌트 마운트 시 자동 포커스
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="border-t bg-white p-4">
      {state.replyingTo && (
        <ReplyPreview
          message={state.replyingTo}
          onCancel={handleCancelReply}
        />
      )}

      <div className="flex gap-2">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={state.messageInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요"
            maxLength={1000}
            className="min-h-10 max-h-24 resize-none"
            rows={2}
          />
          {showCharCounter && (
            <div className="mt-1 text-right text-xs text-gray-500">
              {state.messageInput.length} / 1000
            </div>
          )}
        </div>
        <Button
          onClick={handleSendClick}
          disabled={!canSendMessage}
          className="h-10 self-end"
        >
          전송
        </Button>
      </div>
    </div>
  );
};
