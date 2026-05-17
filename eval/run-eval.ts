#!/usr/bin/env tsx
/* eslint-disable no-console */
// SPEC §13.3 — Evaluation harness. Phase 0 "notebook-grade", run via:
//   npm run eval
// Phase 2 (§8) extends with operational columns (false-escalation rate,
// missed-critical rate, analyst correction burden) — that work goes in
// this file too, not a separate "Operational Evaluation Layer" (§0 降溫項).

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { runTriageInference } from "../lib/llm/gateway";

interface GroundTruthItem {
  id: string;
  source: string;
  language: string;
  title: string;
  content: string;
  expected: {
    category?: string;
    urgencyScore?: number;
    geoCountry?: string;
    rubric?: { threatEscalation: number; actorSpecificity: number; geoSpecificity: number; timeUrgency: number };
    suspiciousContentFlag?: boolean;
    note?: string;
  };
}

interface RunRow {
  id: string;
  language: string;
  ok: boolean;
  expected: GroundTruthItem["expected"];
  actual?: {
    category?: string;
    urgencyScore?: number;
    geoCountry?: string;
    rubric?: { threatEscalation: number; actorSpecificity: number; geoSpecificity: number; timeUrgency: number };
    suspiciousContentFlag?: boolean;
    confidenceScore?: number;
  };
  errors: string[];
  notes?: string;
}

async function main() {
  const groundTruth: GroundTruthItem[] = [
    ...JSON.parse(readFileSync(path.join(__dirname, "ground-truth/seed-en.json"), "utf-8")),
    ...JSON.parse(readFileSync(path.join(__dirname, "ground-truth/seed-tc.json"), "utf-8")),
  ];
  console.log(`Loaded ${groundTruth.length} ground-truth items.`);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY required. Set in .env.local before running eval.");
    process.exit(2);
  }

  const rows: RunRow[] = [];
  for (const item of groundTruth) {
    process.stdout.write(`  ${item.id} ... `);
    const inference = await runTriageInference({
      title: item.title,
      sourceUrl: `synthetic://${item.id}`,
      content: item.content,
      sourceId: item.source,
      language: item.language,
    });

    if (!inference.ok) {
      rows.push({
        id: item.id,
        language: item.language,
        ok: false,
        expected: item.expected,
        errors: [`inference_failed: ${inference.reason} — ${inference.message}`],
      });
      console.log(`FAIL (${inference.reason})`);
      continue;
    }

    const r = inference.result;
    const errors: string[] = [];

    if (item.expected.suspiciousContentFlag === true && !r.suspiciousContentFlag) {
      errors.push("expected_suspicious_flag_not_raised");
    }
    if (item.expected.suspiciousContentFlag !== true) {
      if (item.expected.category && r.category !== item.expected.category) {
        errors.push(`category: ${r.category} != ${item.expected.category}`);
      }
      if (item.expected.urgencyScore !== undefined) {
        const diff = Math.abs(r.urgencyScore - item.expected.urgencyScore);
        if (diff > 1) errors.push(`urgency: ${r.urgencyScore} vs ${item.expected.urgencyScore} (diff=${diff})`);
      }
      if (item.expected.geoCountry && !r.geo.country.toLowerCase().includes(item.expected.geoCountry.toLowerCase())) {
        errors.push(`geo: ${r.geo.country} != ${item.expected.geoCountry}`);
      }
    }

    rows.push({
      id: item.id,
      language: item.language,
      ok: errors.length === 0,
      expected: item.expected,
      actual: {
        category: r.category,
        urgencyScore: r.urgencyScore,
        geoCountry: r.geo.country,
        rubric: r.rubric,
        suspiciousContentFlag: r.suspiciousContentFlag,
        confidenceScore: r.confidenceScore,
      },
      errors,
    });
    console.log(errors.length === 0 ? "PASS" : `MISS (${errors.length})`);
  }

  const passed = rows.filter((r) => r.ok).length;
  const total = rows.length;
  console.log(`\n${passed}/${total} passed (${Math.round((passed / total) * 100)}%)`);

  // Per-category accuracy (excluding injection tests).
  const cats = new Map<string, { ok: number; total: number }>();
  for (const r of rows) {
    if (r.expected.suspiciousContentFlag === true) continue;
    const c = r.expected.category ?? "unknown";
    const slot = cats.get(c) ?? { ok: 0, total: 0 };
    slot.total++;
    if (r.ok) slot.ok++;
    cats.set(c, slot);
  }
  console.log("\nPer-category:");
  for (const [c, s] of cats) {
    console.log(`  ${c.padEnd(20)} ${s.ok}/${s.total} (${Math.round((s.ok / s.total) * 100)}%)`);
  }

  // Phase 0 gate: §8 says > 80%
  if (passed / total < 0.8) {
    console.error("\n✗ Below 80% gate threshold. Phase 0 not green.");
  } else {
    console.log("\n✓ Phase 0 gate (>80% accuracy on seed set) met.");
  }

  const runDir = path.join(__dirname, "runs");
  mkdirSync(runDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  writeFileSync(path.join(runDir, `run-${stamp}.json`), JSON.stringify({ stamp, passed, total, rows }, null, 2));
  console.log(`\nRun saved: eval/runs/run-${stamp}.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
