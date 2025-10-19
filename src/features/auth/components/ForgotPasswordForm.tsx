"use client";

import Link from "next/link";
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
import { forgotPasswordFormSchema, type ForgotPasswordFormData } from "@/features/auth/lib/forgot-password-schema";
import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";

export const ForgotPasswordForm = () => {
  const { toast } = useToast();
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPassword(
      { email: data.email },
      {
        onError: (error) => {
          const message =
            error.error?.message || "일시적인 오류가 발생했습니다. 다시 시도해주세요.";
          toast({
            title: "오류",
            description: message,
            variant: "destructive",
          });
        },
        onSuccess: () => {
          toast({
            title: "이메일 전송됨",
            description: "이메일로 비밀번호 재설정 링크를 전송했습니다. 이메일을 확인해주세요.",
          });
          form.reset();
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
          <h2 className="text-lg font-semibold text-slate-900">비밀번호 찾기</h2>
          <p className="text-sm text-slate-500">
            가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
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
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </FormControl>
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-slate-300"
        >
          {isPending ? "전송 중..." : "재설정 링크 전송"}
        </Button>

        <div className="flex flex-col gap-2 text-sm">
          <Link
            href="/login"
            className="text-center text-blue-600 hover:underline"
          >
            로그인으로 돌아가기
          </Link>
          <Link
            href="/signup"
            className="text-center text-blue-600 hover:underline"
          >
            회원가입하기
          </Link>
        </div>
      </form>
    </Form>
  );
};
