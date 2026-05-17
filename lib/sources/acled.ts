import type { FetchParams, RawArticle, SourceConnector, SourceHealth } from "./types";

// SPEC §8 Phase 1 — ACLED (Armed Conflict Location & Event Data) connector.
// ACLED is the structured-event source for physical_security signals near
// fabs. Free tier requires email + key registration.
//
// This connector queries by country code for the regions of TSMC fabs.

const ACLED_ENDPOINT = "https://api.acleddata.com/acled/read";

// ISO-2 country codes covering TSMC fab + critical supply regions.
const DEFAULT_COUNTRIES = ["TW", "JP", "DE", "US", "KR", "CN", "MY", "SG"] as const;

export class AcledConnector implements SourceConnector {
  readonly id = "acled";
  readonly displayName = "ACLED";
  readonly supportedLanguages = ["en"] as const;

  constructor(
    private readonly email: string,
    private readonly key: string,
  ) {}

  async fetch(params: FetchParams): Promise<RawArticle[]> {
    const articles: RawArticle[] = [];
    const sinceDate = params.since.toISOString().slice(0, 10);

    for (const country of DEFAULT_COUNTRIES) {
      const url = new URL(ACLED_ENDPOINT);
      url.searchParams.set("email", this.email);
      url.searchParams.set("key", this.key);
      url.searchParams.set("iso", isoToNumeric(country));
      url.searchParams.set("event_date", `${sinceDate}|${new Date().toISOString().slice(0, 10)}`);
      url.searchParams.set("event_date_where", "BETWEEN");
      url.searchParams.set("limit", String(params.limit ?? 100));

      const resp = await fetch(url.toString(), { signal: AbortSignal.timeout(20_000) });
      if (!resp.ok) throw new Error(`acled ${country}: ${resp.status}`);
      const data = (await resp.json()) as AcledResponse;

      for (const e of data.data ?? []) {
        articles.push({
          sourceUrl: e.source_url ?? `https://acleddata.com/event/${e.event_id_cnty ?? ""}`,
          publishedAt: new Date(e.event_date),
          title: `${e.event_type} — ${e.location ?? country}`,
          content: [
            `Event: ${e.event_type} / ${e.sub_event_type}`,
            `Location: ${e.location}, ${e.admin1}, ${country}`,
            `Actors: ${e.actor1}${e.actor2 ? ` vs ${e.actor2}` : ""}`,
            `Notes: ${e.notes}`,
            `Fatalities: ${e.fatalities}`,
          ].join("\n"),
          language: "en",
          sourceMetadata: {
            country,
            event_id: e.event_id_cnty,
            event_type: e.event_type,
            sub_event_type: e.sub_event_type,
            fatalities: e.fatalities,
            lat: e.latitude,
            lng: e.longitude,
          },
        });
      }
    }
    return articles;
  }

  async parseStatus(): Promise<SourceHealth> {
    try {
      const url = new URL(ACLED_ENDPOINT);
      url.searchParams.set("email", this.email);
      url.searchParams.set("key", this.key);
      url.searchParams.set("limit", "1");
      const resp = await fetch(url.toString(), { signal: AbortSignal.timeout(8_000) });
      return { ok: resp.ok, message: `HTTP ${resp.status}`, lastSuccessAt: resp.ok ? new Date() : undefined };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : String(err) };
    }
  }
}

// ACLED expects ISO-3166 numeric. Minimal table — extend with full lookup
// when scope expands beyond TSMC fab regions.
function isoToNumeric(iso2: string): string {
  const m: Record<string, string> = {
    TW: "158",
    JP: "392",
    DE: "276",
    US: "840",
    KR: "410",
    CN: "156",
    MY: "458",
    SG: "702",
  };
  return m[iso2] ?? iso2;
}

interface AcledEvent {
  event_id_cnty?: string;
  event_date: string;
  event_type: string;
  sub_event_type: string;
  actor1?: string;
  actor2?: string;
  location?: string;
  admin1?: string;
  notes?: string;
  fatalities?: number;
  latitude?: number;
  longitude?: number;
  source_url?: string;
}
interface AcledResponse {
  status?: number;
  data?: AcledEvent[];
}
