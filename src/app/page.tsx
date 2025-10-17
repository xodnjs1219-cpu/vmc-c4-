"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { HomeLayout } from "@/features/chatroom/components/HomeLayout";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // 인증 체크 - 미인증 시 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  // 인증되지 않은 경우 로딩 표시 (깜빡임 방지)
  if (!isAuthenticated) {
    return null;
  }

  return <HomeLayout />;
}
