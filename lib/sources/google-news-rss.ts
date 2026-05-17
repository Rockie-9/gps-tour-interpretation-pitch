import Parser from "rss-parser";
import type { FetchParams, RawArticle, SourceConnector, SourceHealth } from "./types";

// SPEC §8 Phase 1 — Google News RSS connector (free fallback).
// Note: Google News RSS only returns titles + snippets; no article body.
// That is acceptable as a coarse trigger — high-urgency hits get
// retrieved by hand for richer analysis.

const GNEWS_RSS = "https://news.google.com/rss/search";

const DEFAULT_QUERIES = [
  { q: "TSMC", hl: "en", gl: "US", lang: "en" },
  { q: "台積電", hl: "zh-TW", gl: "TW", lang: "zh" },
  { q: "TSMC Kumamoto", hl: "ja", gl: "JP", lang: "ja" },
  { q: "ESMC Dresden", hl: "de", gl: "DE", lang: "de" },
];

export class GoogleNewsRssConnector implements SourceConnector {
  readonly id = "google_news_rss";
  readonly displayName = "Google News (RSS)";
  readonly supportedLanguages = ["en", "zh", "ja", "de", "ko"] as const;

  private readonly parser = new Parser({ timeout: 15_000 });

  async fetch(params: FetchParams): Promise<RawArticle[]> {
    const queries = params.queries
      ? params.queries.map((q) => ({ q, hl: "en", gl: "US", lang: "en" }))
      : DEFAULT_QUERIES;

    const articles: RawArticle[] = [];
    for (const { q, hl, gl, lang } of queries) {
      const url = new URL(GNEWS_RSS);
      url.searchParams.set("q", q);
      url.searchParams.set("hl", hl);
      url.searchParams.set("gl", gl);
      url.searchParams.set("ceid", `${gl}:${hl.split("-")[0]}`);

      const feed = await this.parser.parseURL(url.toString());
      for (const item of feed.items) {
        const link = item.link;
        const pub = item.isoDate ?? item.pubDate;
        if (!link || !pub) continue;
        const publishedAt = new Date(pub);
        if (publishedAt < params.since) continue;

        articles.push({
          sourceUrl: link,
          publishedAt,
          title: item.title ?? "",
          content: [item.title, item.contentSnippet ?? item.content ?? ""].filter(Boolean).join("\n\n"),
          language: lang,
          sourceMetadata: {
            query: q,
            feed: feed.title,
            guid: item.guid,
          },
        });
      }
      if (params.limit && articles.length >= params.limit) break;
    }
    return params.limit ? articles.slice(0, params.limit) : articles;
  }

  async parseStatus(): Promise<SourceHealth> {
    try {
      const url = new URL(GNEWS_RSS);
      url.searchParams.set("q", "TSMC");
      url.searchParams.set("hl", "en");
      const feed = await this.parser.parseURL(url.toString());
      return {
        ok: (feed.items?.length ?? 0) > 0,
        message: `items=${feed.items?.length ?? 0}`,
        lastSuccessAt: new Date(),
      };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : String(err) };
    }
  }
}
