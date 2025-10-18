"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Mail, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/user/hooks/useCurrentUser";
import { UserInfoSkeleton } from "./UserInfoSkeleton";
import { NicknameEditForm } from "./NicknameEditForm";

export function UserInfoSection() {
  const { data: user, isLoading, isError, error } = useCurrentUser();
  const [isEditMode, setIsEditMode] = useState(false);

  // 로딩 상태
  if (isLoading) {
    return <UserInfoSkeleton />;
  }

  // 에러 상태
  if (isError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-sm text-red-700">
            {error?.message || "사용자 정보를 불러올 수 없습니다."}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return null;
  }

  // 가입일 포맷팅 (YYYY년 MM월 DD일)
  const formattedDate = format(new Date(user.createdAt), "yyyy년 MM월 dd일", {
    locale: ko,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>내 정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 이메일 (읽기 전용) */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Mail className="h-4 w-4" />
            이메일
          </Label>
          <div className="rounded-md border bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {user.email}
          </div>
          <p className="text-xs text-slate-500">
            이메일은 변경할 수 없습니다.
          </p>
        </div>

        {/* 닉네임 (수정 가능) */}
        {isEditMode ? (
          <NicknameEditForm
            currentNickname={user.nickname}
            onCancelAction={() => setIsEditMode(false)}
            onSuccessAction={() => setIsEditMode(false)}
          />
        ) : (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">닉네임</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-md border bg-white px-3 py-2 text-sm">
                {user.nickname}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditMode(true)}
              >
                수정
              </Button>
            </div>
          </div>
        )}

        {/* 가입일 (읽기 전용) */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Calendar className="h-4 w-4" />
            가입일
          </Label>
          <div className="rounded-md border bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {formattedDate}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
