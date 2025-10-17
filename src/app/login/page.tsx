"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useAuthStore } from "@/features/auth/store/auth-store";

type LoginPageProps = {
  params: Promise<Record<string, never>>;
};

export default function LoginPage({ params }: LoginPageProps) {
  void params;
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // 이미 로그인된 사용자는 홈으로 리디렉션
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-10 px-6 py-16">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-semibold">로그인</h1>
        <p className="text-slate-500">
          이메일과 비밀번호를 입력하여 로그인하세요.
        </p>
      </header>
      <div className="grid w-full gap-8 md:grid-cols-2">
        <LoginForm />
        <figure className="overflow-hidden rounded-xl border border-slate-200">
          <img
            src="https://picsum.photos/seed/login/640/640"
            alt="로그인"
            className="h-full w-full object-cover"
          />
        </figure>
      </div>
    </div>
  );
}
