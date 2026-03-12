"use client";

import { useQuery } from "@tanstack/react-query";
import type { ConflictsResponse } from "@/types/conflict";
import { REFRESH_CONFLICTS } from "@/lib/constants";

export function useConflicts() {
  return useQuery<ConflictsResponse>({
    queryKey: ["conflicts"],
    queryFn: async () => {
      const res = await fetch("/api/conflicts");
      if (!res.ok) throw new Error("Failed to fetch conflicts");
      return res.json();
    },
    refetchInterval: REFRESH_CONFLICTS,
    staleTime: REFRESH_CONFLICTS,
  });
}
