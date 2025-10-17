"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/remote/api-client";

export type Room = {
  id: string;
  name: string;
  creatorId: string;
  creatorNickname: string;
  createdAt: string;
};

type RoomsResponse = {
  data: Room[];
};

export const useRooms = () => {
  return useQuery<Room[], Error>({
    queryKey: ["rooms"],
    queryFn: async () => {
      const response = await apiClient.get<RoomsResponse>("/api/rooms");
      return response.data.data;
    },
    staleTime: 30 * 1000, // 30초
    refetchOnWindowFocus: true,
    refetchInterval: false,
  });
};
