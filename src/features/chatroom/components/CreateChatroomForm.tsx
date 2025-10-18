"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  createRoomFormSchema,
  type CreateRoomFormData,
} from "@/features/chatroom/lib/create-room-schema";
import { useCreateChatroom } from "@/features/chatroom/hooks/useCreateChatroom";

export function CreateChatroomForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [charCount, setCharCount] = useState(0);
  const { mutate: createRoom, isPending } = useCreateChatroom();

  const form = useForm<CreateRoomFormData>({
    resolver: zodResolver(createRoomFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleNameChange = (value: string) => {
    setCharCount(value.length);
    form.setValue("name", value);
  };

  const onSubmit = (data: CreateRoomFormData) => {
    createRoom(
      { name: data.name },
      {
        onError: (error) => {
          const errorCode = error.error?.code;
          const errorMessage = error.error?.message || "채팅방 생성 중 오류가 발생했습니다";

          if (errorCode === "ROOM_NAME_DUPLICATE") {
            toast({
              title: "중복된 이름",
              description: errorMessage,
              variant: "destructive",
            });
          } else if (errorCode === "UNAUTHORIZED") {
            toast({
              title: "인증 실패",
              description: "다시 로그인해주세요",
              variant: "destructive",
            });
            router.replace("/login");
          } else {
            toast({
              title: "오류",
              description: errorMessage,
              variant: "destructive",
            });
          }
        },
      }
    );
  };

  return (
    <Card className="w-full p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="name">채팅방 이름</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="name"
                    placeholder="채팅방 이름을 입력하세요"
                    disabled={isPending}
                    onChange={(e) => {
                      handleNameChange(e.target.value);
                      field.onChange(e);
                    }}
                    maxLength={100}
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                </FormControl>
                <div className="mt-2 text-right text-sm text-slate-500">
                  {charCount}/100
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
              disabled={isPending}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                "만들기"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
