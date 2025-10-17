"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorRoomStateProps = {
  error: Error | null;
  onRetryAction: () => void;
};

export function ErrorRoomState({ error, onRetryAction }: ErrorRoomStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-12 text-center">
      <AlertCircle className="mb-4 h-16 w-16 text-red-500" />
      <h3 className="mb-2 text-lg font-semibold text-red-900">
        채팅방 목록을 불러올 수 없습니다
      </h3>
      <p className="mb-6 text-sm text-red-700">
        {error?.message || "일시적인 오류가 발생했습니다. 다시 시도해주세요."}
      </p>
      <Button onClick={onRetryAction} variant="outline">
        다시 시도
      </Button>
    </div>
  );
}
