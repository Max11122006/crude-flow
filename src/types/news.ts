export type Severity = "INFO" | "WARNING" | "ALERT" | "CRITICAL";

export interface NewsEntry {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  severity: Severity;
}

export interface NewsFeedResponse {
  entries: NewsEntry[];
}
