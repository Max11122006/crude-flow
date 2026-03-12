"use client";

import { useQuery } from "@tanstack/react-query";
import type { NewsFeedResponse } from "@/types/news";
import { REFRESH_NEWS } from "@/lib/constants";

export function useNewsFeed() {
  return useQuery<NewsFeedResponse>({
    queryKey: ["news-feed"],
    queryFn: async () => {
      const res = await fetch("/api/news");
      if (!res.ok) throw new Error("Failed to fetch news");
      return res.json();
    },
    refetchInterval: REFRESH_NEWS,
    staleTime: REFRESH_NEWS,
  });
}
