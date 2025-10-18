"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUpdateNickname } from "@/features/user/hooks/useUpdateNickname";
import { useAuthStore } from "@/features/auth/store/auth-store";

// 닉네임 검증 스키마
const nicknameSchema = z.object({
  nickname: z
    .string()
    .min(1, { message: "닉네임을 입력해주세요" })
    .min(2, { message: "닉네임은 2자 이상이어야 합니다" })
    .max(20, { message: "닉네임은 20자 이하여야 합니다" })
    .trim(),
});

type NicknameFormData = z.infer<typeof nicknameSchema>;

type NicknameEditFormProps = {
  currentNickname: string;
  onCancelAction: () => void;
  onSuccessAction: () => void;
};

export function NicknameEditForm({
  currentNickname,
  onCancelAction,
  onSuccessAction,
}: NicknameEditFormProps) {
  const { toast } = useToast();
  const { updateUser } = useAuthStore();
  const { mutate: updateNickname, isPending } = useUpdateNickname();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<NicknameFormData>({
    resolver: zodResolver(nicknameSchema),
    defaultValues: {
      nickname: currentNickname,
    },
  });

  const onSubmit = (data: NicknameFormData) => {
    const trimmedNickname = data.nickname.trim();

    // 현재 닉네임과 동일한지 확인
    if (trimmedNickname === currentNickname) {
      setError("nickname", {
        type: "manual",
        message: "현재 닉네임과 동일합니다",
      });
      return;
    }

    updateNickname(
      { nickname: trimmedNickname },
      {
        onSuccess: (response) => {
          // authStore 업데이트 (전역 동기화)
          updateUser({ nickname: response.nickname });

          toast({
            title: "닉네임 변경 완료",
            description: "닉네임이 성공적으로 변경되었습니다.",
          });
          onSuccessAction();
        },
        onError: (error) => {
          const message = error.message || "닉네임 수정에 실패했습니다.";

          // 중복 에러인 경우 폼 에러로 표시
          if (message.includes("중복") || message.includes("이미 사용")) {
            setError("nickname", {
              type: "manual",
              message: "이미 사용 중인 닉네임입니다",
            });
          } else {
            // 기타 에러는 토스트로 표시
            toast({
              variant: "destructive",
              title: "오류 발생",
              description: message,
            });
          }
        },
      }
    );
  };

  const handleCancel = () => {
    onCancelAction();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <Label htmlFor="nickname" className="text-sm font-medium text-slate-700">
        닉네임
      </Label>
      <div className="flex items-start gap-2">
        <div className="flex-1 space-y-1">
          <Input
            id="nickname"
            {...register("nickname")}
            placeholder="새 닉네임 입력"
            disabled={isPending}
            className={errors.nickname ? "border-red-500" : ""}
            autoFocus
          />
          {errors.nickname && (
            <p className="text-xs text-red-600">{errors.nickname.message}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                저장 중
              </>
            ) : (
              "저장"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isPending}
          >
            취소
          </Button>
        </div>
      </div>
    </form>
  );
}
