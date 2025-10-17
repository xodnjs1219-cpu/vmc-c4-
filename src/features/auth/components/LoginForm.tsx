"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
import { loginFormSchema, type LoginFormData } from "@/features/auth/lib/login-schema";
import { useLogin } from "@/features/auth/hooks/useLogin";

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { mutate: login, isPending } = useLogin();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(
      { email: data.email, password: data.password },
      {
        onError: (error) => {
          const message =
            error.error?.message || "로그인에 실패했습니다. 다시 시도해주세요.";
          toast({
            title: "로그인 실패",
            description: message,
            variant: "destructive",
          });
        },
        onSuccess: () => {
          toast({
            title: "로그인 성공",
            description: "로그인하셨습니다.",
          });
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-slate-900">계정 로그인</h2>
          <p className="text-sm text-slate-500">
            계정에 로그인하여 채팅을 시작하세요.
          </p>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-sm text-slate-700">
                이메일
              </Label>
              <FormControl>
                <Input
                  {...field}
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  disabled={isPending}
                  className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none disabled:bg-slate-100"
                />
              </FormControl>
              <FormMessage className="text-xs text-rose-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-sm text-slate-700">
                비밀번호
              </Label>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="8자 이상의 비밀번호"
                    disabled={isPending}
                    className="rounded-md border border-slate-300 px-3 py-2 pr-10 text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none disabled:bg-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isPending}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700 disabled:cursor-not-allowed"
                    aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="text-xs text-rose-500" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isPending}
          className="mt-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isPending ? "로그인 중..." : "로그인"}
        </Button>

        <div className="flex flex-col gap-2 text-xs text-slate-600">
          <p>
            계정이 없으신가요?{" "}
            <Link
              href="/signup"
              className="font-medium text-slate-700 underline hover:text-slate-900"
            >
              회원가입하기
            </Link>
          </p>
          <p>
            <Link
              href="/forgot-password"
              className="font-medium text-slate-700 underline hover:text-slate-900"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </p>
        </div>
      </form>
    </Form>
  );
};
