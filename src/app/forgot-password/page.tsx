"use client";

import Image from "next/image";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-10 px-6 py-16">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-semibold">비밀번호 찾기</h1>
        <p className="text-slate-500">
          가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
        </p>
      </header>
      <div className="grid w-full gap-8 md:grid-cols-2">
        <ForgotPasswordForm />
        <figure className="overflow-hidden rounded-xl border border-slate-200">
          <Image
            src="https://picsum.photos/seed/forgot-password/640/640"
            alt="비밀번호 찾기"
            width={640}
            height={640}
            className="h-full w-full object-cover"
          />
        </figure>
      </div>
    </div>
  );
}
