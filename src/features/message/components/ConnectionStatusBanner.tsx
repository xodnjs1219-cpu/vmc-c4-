'use client';

import { useChatRoomContext } from '../context/ChatRoomProvider';

export const ConnectionStatusBanner: React.FC = () => {
  const { state } = useChatRoomContext();

  if (state.connectionStatus === 'connected') {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 bg-yellow-50 px-4 py-2 text-sm text-yellow-800">
      {state.connectionStatus === 'disconnected' && (
        <>
          <span>⚠️</span>
          <span>연결이 끊어졌습니다</span>
        </>
      )}
      {state.connectionStatus === 'reconnecting' && (
        <>
          <span>🔄</span>
          <span>재연결 중...</span>
        </>
      )}
    </div>
  );
};
