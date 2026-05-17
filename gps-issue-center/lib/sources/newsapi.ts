import type { FetchParams, RawArticle, SourceConnector, SourceHealth } from "./types";

// SPEC §8 Phase 1 — NewsAPI multi-language news connector.
// Tier: developer plan (free) for Phase 0, paid for Phase 1.

const NEWSAPI_ENDPOINT = "https://newsapi.org/v2/everything";

// TSMC fab + supply-chain query targets (kept narrow on purpose; broader
// queries drive cost up faster than they improve recall).
const DEFAULT_QUERIES = [
  "TSMC OR 台積電",
  "Hsinchu Science Park",
  "Tainan fab",
  "Kumamoto semiconductor",
  "Dresden ESMC",
  "Arizona TSMC Phoenix",
  "semiconductor export control",
  "chip sanctions",
];

export class NewsApiConnector implements SourceConnector {
  readonly id = "newsapi";
  readonly displayName = "NewsAPI";
  readonly supportedLanguages = ["en", "zh", "ja", "de", "ko"] as const;

  constructor(private readonly apiKey: string) {}

  async fetch(params: FetchParams): Promise<RawArticle[]> {
    const queries = params.queries ?? DEFAULT_QUERIES;
    const articles: RawArticle[] = [];

    for (const q of queries) {
      const url = new URL(NEWSAPI_ENDPOINT);
      url.searchParams.set("q", q);
      url.searchParams.set("from", params.since.toISOString());
      url.searchParams.set("sortBy", "publishedAt");
      url.searchParams.set("pageSize", String(Math.min(params.limit ?? 50, 100)));

      const resp = await fetch(url.toString(), {
        headers: { "X-Api-Key": this.apiKey },
        // Phase 1 — Vercel serverless function timeout protection.
        signal: AbortSignal.timeout(15_000),
      });
      if (!resp.ok) {
        throw new Error(`newsapi ${q}: ${resp.status} ${resp.statusText}`);
      }
      const data = (await resp.json()) as NewsApiResponse;
      for (const a of data.articles ?? []) {
        if (!a.url || !a.publishedAt) continue;
        articles.push({
          sourceUrl: a.url,
          publishedAt: new Date(a.publishedAt),
          title: a.title ?? "",
          content: composeContent(a),
          language: detectLanguage(q, a),
          sourceMetadata: {
            query: q,
            sourceName: a.source?.name,
            author: a.author,
          },
        });
      }
    }
    return articles;
  }

  async parseStatus(): Promise<SourceHealth> {
    try {
      const url = new URL(NEWSAPI_ENDPOINT);
      url.searchParams.set("q", "TSMC");
      url.searchParams.set("pageSize", "1");
      const resp = await fetch(url.toString(), {
        headers: { "X-Api-Key": this.apiKey },
        signal: AbortSignal.timeout(8_000),
      });
      return { ok: resp.ok, message: `HTTP ${resp.status}`, lastSuccessAt: resp.ok ? new Date() : undefined };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : String(err) };
    }
  }
}

interface NewsApiArticle {
  url?: string;
  publishedAt?: string;
  title?: string | null;
  description?: string | null;
  content?: string | null;
  author?: string | null;
  source?: { id?: string; name?: string };
}
interface NewsApiResponse {
  status?: string;
  articles?: NewsApiArticle[];
}

function composeContent(a: NewsApiArticle): string {
  // NewsAPI returns truncated `content`; combine title + description + content
  // so the model has enough signal without us scraping the source page.
  return [a.title, a.description, a.content].filter(Boolean).join("\n\n");
}

function detectLanguage(query: string, a: NewsApiArticle): string {
  // NewsAPI doesn't return language reliably per article; rough heuristic.
  if (/台積電/.test(query)) return "zh";
  if (/Kumamoto|半導体/.test(query)) return "ja";
  if (/Dresden/.test(query)) return "de";
  if (a.title && /[一-鿿]/.test(a.title)) return "zh";
  if (a.title && /[぀-ヿ]/.test(a.title)) return "ja";
  return "en";
}
