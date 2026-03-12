import type { Severity } from "@/types/news";

const CRITICAL_KEYWORDS = [
  "attack",
  "missile",
  "explosion",
  "torpedo",
  "hijack",
  "seized",
  "struck",
  "sunk",
  "casualties",
  "killed",
  "bombing",
  "drone strike",
  "warship",
  "naval clash",
];

const ALERT_KEYWORDS = [
  "piracy",
  "military",
  "escalation",
  "threat",
  "incident",
  "collision",
  "grounding",
  "spill",
  "fire",
  "emergency",
  "distress",
  "hostage",
  "blockade",
  "intercept",
];

const WARNING_KEYWORDS = [
  "sanctions",
  "delay",
  "storm",
  "disruption",
  "closure",
  "restriction",
  "warning",
  "advisory",
  "diversion",
  "congestion",
  "protest",
  "dispute",
  "embargo",
  "weather",
  "hurricane",
  "typhoon",
  "cyclone",
];

export function classifySeverity(title: string, summary: string): Severity {
  const text = `${title} ${summary}`.toLowerCase();

  if (CRITICAL_KEYWORDS.some((kw) => text.includes(kw))) return "CRITICAL";
  if (ALERT_KEYWORDS.some((kw) => text.includes(kw))) return "ALERT";
  if (WARNING_KEYWORDS.some((kw) => text.includes(kw))) return "WARNING";
  return "INFO";
}
