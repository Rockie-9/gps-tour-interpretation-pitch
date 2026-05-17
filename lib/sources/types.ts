// SPEC §6.6 — Source connector interface contract.
//
// Phase 1 connectors written ad-hoc, then refactored into this interface
// at Week 5. Every connector added after Week 5 MUST implement this.
// Future cutover to a commercial OSINT feed in Phase 3 is just a new
// implementation of this interface.

export interface SourceConnector {
  /** Stable identifier — used as PK in queue rows and source_state. */
  readonly id: string;
  /** Human label for UI. */
  readonly displayName: string;
  /** BCP-47 language codes the connector can fetch (e.g. ["en", "ja"]). */
  readonly supportedLanguages: readonly string[];

  fetch(params: FetchParams): Promise<RawArticle[]>;

  /**
   * Quick health check, called by §6.6 degraded-mode policy.
   * Should not exceed a few seconds; never throws — returns SourceHealth.
   */
  parseStatus(): Promise<SourceHealth>;
}

export interface FetchParams {
  /** Inclusive lower bound for publishedAt. Connector may approximate. */
  since: Date;
  /** Optional explicit list of queries/keywords to use. */
  queries?: string[];
  /** Optional cap on number of results to keep request sizes predictable. */
  limit?: number;
}

export interface RawArticle {
  sourceUrl: string;
  publishedAt: Date;
  title: string;
  content: string;
  language: string;
  sourceMetadata: Record<string, unknown>;
}

export interface SourceHealth {
  ok: boolean;
  /** Free-text diagnostic shown in source-health dashboard. */
  message?: string;
  /** When the connector last successfully fetched. Optional. */
  lastSuccessAt?: Date;
}
