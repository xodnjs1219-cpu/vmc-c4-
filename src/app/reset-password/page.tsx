"use client";

import Image from "next/image";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

function ResetPasswordContent() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-10 px-6 py-16">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-semibold">비밀번호 재설정</h1>
        <p className="text-slate-500">
          새로운 비밀번호를 입력해주세요.
        </p>
      </header>
      <div className="grid w-full gap-8 md:grid-cols-2">
        <ResetPasswordForm />
        <figure className="overflow-hidden rounded-xl border border-slate-200">
          <Image
            src="https://picsum.photos/seed/reset-password/640/640"
            alt="비밀번호 재설정"
            width={640}
            height={640}
            className="h-full w-full object-cover"
          />
        </figure>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">로딩 중...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
