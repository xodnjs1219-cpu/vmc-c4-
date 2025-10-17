"use client";

import { useRouter } from "next/navigation";
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
import { signupFormSchema, type SignupFormData } from "@/features/auth/lib/signup-schema";
import { useSignup } from "@/features/auth/hooks/useSignup";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export const SignupForm = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { mutate: signup, isPending } = useSignup();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      nickname: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const onSubmit = (data: SignupFormData) => {
    signup(data, {
      onSuccess: () => {
        toast({
          title: "성공",
          description: "회원가입이 완료되었습니다",
          variant: "default",
        });

        setTimeout(() => {
          router.push("/login");
        }, 2000);
      },
      onError: (error) => {
        const message = error.error?.message || "회원가입에 실패했습니다";
        const code = error.error?.code;

        toast({
          title: "실패",
          description: message,
          variant: "destructive",
        });

        // 서버 에러에서 반환되는 에러 코드에 따라 특정 필드에 에러 설정
        if (code === "NICKNAME_DUPLICATE") {
          form.setError("nickname", {
            message: "이미 사용 중인 닉네임입니다",
          });
        } else if (code === "EMAIL_DUPLICATE") {
          form.setError("email", {
            message: "이미 가입된 이메일입니다",
          });
        }
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        {/* 닉네임 필드 */}
        <FormField
          control={form.control}
          name="nickname"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="nickname">닉네임</Label>
              <FormControl>
                <Input
                  id="nickname"
                  placeholder="사용할 닉네임을 입력하세요"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 이메일 필드 */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="email">이메일</Label>
              <FormControl>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 비밀번호 필드 */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="password">비밀번호</Label>
              <FormControl>
                <Input
                  id="password"
                  type="password"
                  placeholder="8자 이상의 비밀번호"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-slate-500">
                비밀번호는 8자 이상이어야 합니다
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 비밀번호 확인 필드 */}
        <FormField
          control={form.control}
          name="passwordConfirm"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
              <FormControl>
                <Input
                  id="passwordConfirm"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 제출 버튼 */}
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              처리 중...
            </>
          ) : (
            "회원가입"
          )}
        </Button>

        {/* 로그인 링크 */}
        <div className="text-center text-sm text-slate-600">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="font-semibold text-slate-900 hover:underline"
          >
            로그인
          </Link>
        </div>
      </form>
    </Form>
  );
};
