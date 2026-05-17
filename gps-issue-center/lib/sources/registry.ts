import { AcledConnector } from "./acled";
import { GoogleNewsRssConnector } from "./google-news-rss";
import { NewsApiConnector } from "./newsapi";
import type { SourceConnector } from "./types";

// Registry assembled at request-time from env. Missing credentials
// silently drop the connector — that's a degraded-mode condition (§8 Phase 1),
// not an outage. Source health dashboard shows what's online.

export function getEnabledSources(): SourceConnector[] {
  const sources: SourceConnector[] = [];

  if (process.env.NEWSAPI_KEY) {
    sources.push(new NewsApiConnector(process.env.NEWSAPI_KEY));
  }
  sources.push(new GoogleNewsRssConnector());

  if (process.env.ACLED_EMAIL && process.env.ACLED_KEY) {
    sources.push(new AcledConnector(process.env.ACLED_EMAIL, process.env.ACLED_KEY));
  }

  return sources;
}

export function getSourceById(id: string): SourceConnector | undefined {
  return getEnabledSources().find((s) => s.id === id);
}
