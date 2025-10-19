"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { resetPasswordFormSchema, type ResetPasswordFormData } from "@/features/auth/lib/reset-password-schema";
import { useResetPassword } from "@/features/auth/hooks/useResetPassword";

export const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const { mutate: resetPassword, isPending } = useResetPassword();

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
      toast({
        title: "오류",
        description: "유효하지 않은 링크입니다. 비밀번호 찾기를 다시 시도해주세요.",
        variant: "destructive",
      });
      setTimeout(() => {
        router.push("/forgot-password");
      }, 2000);
    }
  }, [token, router, toast]);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) return;

    resetPassword(
      {
        token,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      },
      {
        onError: (error) => {
          const message = error.error?.message || "일시적인 오류가 발생했습니다. 다시 시도해주세요.";
          
          if (error.error?.code === "INVALID_TOKEN") {
            toast({
              title: "오류",
              description: "링크가 만료되었습니다. 비밀번호 찾기를 다시 시도해주세요.",
              variant: "destructive",
            });
            setTimeout(() => {
              router.push("/forgot-password");
            }, 2000);
          } else {
            toast({
              title: "오류",
              description: message,
              variant: "destructive",
            });
          }
        },
      },
    );
  };

  if (!isTokenValid) {
    return (
      <div className="flex flex-col gap-6 rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-slate-900">오류</h2>
          <p className="text-sm text-slate-500">
            유효하지 않은 링크입니다. 비밀번호 찾기를 다시 시도해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-slate-900">비밀번호 재설정</h2>
          <p className="text-sm text-slate-500">
            새로운 비밀번호를 입력해주세요.
          </p>
        </div>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-sm text-slate-700">
                새 비밀번호
              </Label>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="새 비밀번호를 입력해주세요"
                    disabled={isPending}
                    className="rounded-lg border border-slate-300 px-3 py-2 pr-10 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isPending}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="passwordConfirm"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <Label htmlFor="passwordConfirm" className="text-sm text-slate-700">
                비밀번호 확인
              </Label>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    id="passwordConfirm"
                    type={showPasswordConfirm ? "text" : "password"}
                    placeholder="비밀번호를 다시 입력해주세요"
                    disabled={isPending}
                    className="rounded-lg border border-slate-300 px-3 py-2 pr-10 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    disabled={isPending}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
                  >
                    {showPasswordConfirm ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isPending || !isTokenValid}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-slate-300"
        >
          {isPending ? "변경 중..." : "비밀번호 변경"}
        </Button>
      </form>
    </Form>
  );
};
