"use client";

import { useState } from "react";
import type { NewsEntry } from "@/types/news";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface IntelEntryProps {
  entry: NewsEntry;
}

export function IntelEntry({ entry }: IntelEntryProps) {
  const [expanded, setExpanded] = useState(false);

  const time = new Date(entry.publishedAt);
  const timeStr = `${time.getUTCHours().toString().padStart(2, "0")}:${time.getUTCMinutes().toString().padStart(2, "0")} UTC`;

  return (
    <div
      className="slide-in cursor-pointer border-b border-border-default px-4 py-3 transition-colors hover:bg-bg-hover"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="font-mono text-[0.65rem] tabular-nums text-text-tertiary">
          {timeStr}
        </span>
        <StatusBadge type={entry.severity} />
      </div>
      <h3 className="text-sm font-medium leading-snug text-text-primary">
        {entry.title}
      </h3>
      <p className="mt-0.5 font-mono text-[0.65rem] text-text-tertiary">
        {entry.source}
      </p>
      {expanded && (
        <div className="mt-2">
          <p className="text-xs leading-relaxed text-text-secondary">
            {entry.summary}
          </p>
          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block font-mono text-[0.65rem] text-accent-blue hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Read full article →
          </a>
        </div>
      )}
    </div>
  );
}
