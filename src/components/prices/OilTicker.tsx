"use client";

import { useOilPrices } from "@/hooks/useOilPrices";
import { Sparkline } from "./Sparkline";

function PriceItem({
  label,
  price,
  change,
  changePercent,
  sparkline,
}: {
  label: string;
  price: number;
  change: number;
  changePercent: number;
  sparkline: number[];
}) {
  const isPositive = change >= 0;
  const changeColor = isPositive ? "text-accent-green" : "text-accent-red";
  const sparkColor = isPositive ? "#22c55e" : "#ef4444";

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[0.65rem] font-semibold tracking-wider text-text-tertiary">
        {label}
      </span>
      <span className="font-mono text-sm font-bold tabular-nums text-accent-amber">
        ${price.toFixed(2)}
      </span>
      <span className={`font-mono text-[0.65rem] tabular-nums ${changeColor}`}>
        {isPositive ? "+" : ""}
        {changePercent.toFixed(2)}%
      </span>
      <Sparkline data={sparkline} color={sparkColor} />
    </div>
  );
}

export function OilTicker() {
  const { data, isLoading } = useOilPrices();

  if (isLoading || !data) {
    return (
      <div className="flex items-center gap-4">
        <div className="h-4 w-32 animate-pulse rounded bg-bg-tertiary" />
        <div className="h-4 w-32 animate-pulse rounded bg-bg-tertiary" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <PriceItem
        label="BRENT"
        price={data.brent.price}
        change={data.brent.change}
        changePercent={data.brent.changePercent}
        sparkline={data.brent.sparkline}
      />
      <PriceItem
        label="WTI"
        price={data.wti.price}
        change={data.wti.change}
        changePercent={data.wti.changePercent}
        sparkline={data.wti.sparkline}
      />
    </div>
  );
}
