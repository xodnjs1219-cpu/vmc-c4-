"use client";

import { useRouter } from "next/navigation";
import { Plus, User, LogOut } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { RoomList } from "./RoomList";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function HomeLayout() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { toast } = useToast();

  const handleCreateRoom = () => {
    router.push("/app/create-room");
  };

  const handleMyPage = () => {
    router.push("/mypage");
  };

  const handleLogout = () => {
    clearAuth();
    toast({
      title: "로그아웃 완료",
      description: "성공적으로 로그아웃되었습니다.",
    });
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">채팅 서비스</h1>
            {user && (
              <span className="text-sm text-slate-500">{user.nickname}님</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleCreateRoom}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">새 채팅방 만들기</span>
              <span className="sm:hidden">만들기</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleMyPage}
            >
              <User className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 bg-slate-50">
        <div className="container mx-auto px-4 py-6">
          <RoomList />
        </div>
      </main>
    </div>
  );
}
