'use client';

import { useRef, useEffect } from 'react';
import { useChatRoomContext } from '../context/ChatRoomProvider';
import { actions } from '../context/actions';
import { ReplyPreview } from './ReplyPreview';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

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
    <div className="border-t border-gray-200 bg-white p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {state.replyingTo && (
        <ReplyPreview
          message={state.replyingTo}
          onCancel={handleCancelReply}
        />
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={state.messageInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요"
            maxLength={1000}
            className="min-h-[44px] max-h-32 resize-none rounded-2xl border-gray-300 px-4 py-3 text-sm focus-visible:ring-1 focus-visible:ring-yellow-400"
            rows={1}
          />
          {showCharCounter && (
            <div className="mt-1 px-2 text-right text-[10px] text-gray-400">
              {state.messageInput.length} / 1000
            </div>
          )}
        </div>
        <Button
          onClick={handleSendClick}
          disabled={!canSendMessage}
          size="icon"
          className="h-11 w-11 flex-shrink-0 rounded-full bg-yellow-400 text-gray-900 hover:bg-yellow-500 disabled:bg-gray-200 disabled:text-gray-400"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
