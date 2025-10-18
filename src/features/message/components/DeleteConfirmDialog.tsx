'use client';

import { Button } from '@/components/ui/button';
import { useChatRoomContext } from '../context/ChatRoomProvider';
import { actions } from '../context/actions';

export const DeleteConfirmDialog: React.FC = () => {
  const { state, dispatch, deleteMessage } = useChatRoomContext();

  const handleConfirm = async () => {
    if (state.deletingMessageId) {
      await deleteMessage(state.deletingMessageId);
    }
  };

  const handleCancel = () => {
    dispatch(actions.cancelDeleting());
  };

  if (!state.deletingMessageId) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold">메시지 삭제</h2>
        <p className="mt-2 text-sm text-gray-600">
          메시지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
        </p>
        <div className="mt-6 flex gap-2 justify-end">
          <Button variant="outline" onClick={handleCancel}>
            취소
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            삭제
          </Button>
        </div>
      </div>
    </div>
  );
};
