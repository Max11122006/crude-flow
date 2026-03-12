"use client";

import { useNewsFeed } from "@/hooks/useNewsFeed";
import { IntelEntry } from "./IntelEntry";

export function IntelFeed() {
  const { data, isLoading } = useNewsFeed();

  return (
    <div className="flex h-full flex-col">
      <div className="panel-header flex items-center justify-between">
        <span className="border-l-2 border-accent-blue pl-2">INTEL FEED</span>
        <span className="text-[0.6rem] text-text-tertiary">LIVE</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-bg-tertiary" />
                <div className="h-4 w-full animate-pulse rounded bg-bg-tertiary" />
                <div className="h-3 w-16 animate-pulse rounded bg-bg-tertiary" />
              </div>
            ))}
          </div>
        ) : !data?.entries.length ? (
          <div className="flex h-32 items-center justify-center text-xs text-text-tertiary">
            No intel available — configure GNEWS_API_KEY
          </div>
        ) : (
          data.entries.map((entry) => (
            <IntelEntry key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
}
