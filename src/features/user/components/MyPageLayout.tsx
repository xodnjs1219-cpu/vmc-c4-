"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserInfoSection } from "./UserInfoSection";

export function MyPageLayout() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="container mx-auto flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">뒤로</span>
          </Button>
          <h1 className="text-xl font-bold text-slate-900">마이페이지</h1>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1">
        <div className="container mx-auto max-w-2xl px-4 py-6">
          <UserInfoSection />
        </div>
      </main>
    </div>
  );
}
