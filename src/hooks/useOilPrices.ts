"use client";

import { useQuery } from "@tanstack/react-query";
import type { OilPricesResponse } from "@/types/prices";
import { REFRESH_OIL_PRICES } from "@/lib/constants";

export function useOilPrices() {
  return useQuery<OilPricesResponse>({
    queryKey: ["oil-prices"],
    queryFn: async () => {
      const res = await fetch("/api/oil-prices");
      if (!res.ok) throw new Error("Failed to fetch oil prices");
      return res.json();
    },
    refetchInterval: REFRESH_OIL_PRICES,
    staleTime: REFRESH_OIL_PRICES,
  });
}
