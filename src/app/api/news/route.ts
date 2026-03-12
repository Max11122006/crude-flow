import { NextResponse } from "next/server";
import crypto from "crypto";
import type { NewsEntry, NewsFeedResponse } from "@/types/news";
import { classifySeverity } from "@/lib/news-classifier";

function hashId(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex").slice(0, 16);
}

let cache: { data: NewsFeedResponse; timestamp: number } | null = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const SEARCH_QUERIES = [
  "oil shipping tanker",
  "Strait of Hormuz",
  "Suez Canal shipping",
  "oil pipeline OPEC",
  "maritime security piracy",
];

async function fetchGNews(query: string): Promise<NewsEntry[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10&apikey=${apiKey}`,
      { next: { revalidate: 600 } }
    );

    if (!res.ok) return [];
    const data = await res.json();

    return (data.articles || []).map(
      (article: {
        title: string;
        description: string;
        source: { name: string };
        url: string;
        publishedAt: string;
      }) => ({
        id: hashId(article.url),
        title: article.title,
        summary: article.description || "",
        source: article.source?.name || "Unknown",
        url: article.url,
        publishedAt: article.publishedAt,
        severity: classifySeverity(article.title, article.description || ""),
      })
    );
  } catch {
    return [];
  }
}

async function fetchRSS(): Promise<NewsEntry[]> {
  try {
    // Dynamic import for rss-parser (CommonJS module)
    const Parser = (await import("rss-parser")).default;
    const parser = new Parser();

    const feeds = [
      "https://news.un.org/feed/subscribe/en/news/topic/economic-development/feed/rss.xml",
    ];

    const results: NewsEntry[] = [];
    for (const feedUrl of feeds) {
      try {
        const feed = await parser.parseURL(feedUrl);
        for (const item of feed.items.slice(0, 5)) {
          const title = item.title || "";
          const summary = item.contentSnippet || item.content || "";
          // Only include oil/shipping related items
          const text = `${title} ${summary}`.toLowerCase();
          if (
            text.includes("oil") ||
            text.includes("shipping") ||
            text.includes("tanker") ||
            text.includes("maritime") ||
            text.includes("energy")
          ) {
            results.push({
              id: hashId(item.link || title),
              title,
              summary,
              source: feed.title || "RSS",
              url: item.link || "",
              publishedAt: item.isoDate || new Date().toISOString(),
              severity: classifySeverity(title, summary),
            });
          }
        }
      } catch {
        // Skip failed feeds
      }
    }
    return results;
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      return NextResponse.json(cache.data);
    }

    // Rotate through search queries to spread rate limits
    const queryIndex = Math.floor(Date.now() / CACHE_DURATION) % SEARCH_QUERIES.length;
    const query = SEARCH_QUERIES[queryIndex];

    const [gnewsResults, rssResults] = await Promise.all([
      fetchGNews(query),
      fetchRSS(),
    ]);

    // Merge, deduplicate by title similarity, sort by date
    const allEntries = [...gnewsResults, ...rssResults];
    const seen = new Set<string>();
    const unique = allEntries.filter((entry) => {
      const key = entry.title.toLowerCase().slice(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    unique.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    const response: NewsFeedResponse = {
      entries: unique.slice(0, 50),
    };

    cache = { data: response, timestamp: Date.now() };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ entries: [] });
  }
}
