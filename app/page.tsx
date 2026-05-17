import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <h1>GPS Issue & Management Center</h1>
      <p className="muted">
        OSINT-driven issue detection and case management for the TSMC GPS team.
        Spec v0.4 · Phase 0 scaffold.
      </p>

      <h2>What this is</h2>
      <p>
        Public-source articles are fetched on an hourly schedule, run through a
        pragmatic-rubric triage model, surfaced as Issues, and managed through
        a lightweight case workflow. Human-in-the-loop correction is required
        for any judgment that goes out the door.
      </p>

      <h2>Where to go</h2>
      <ul>
        <li><Link href="/issues">Issues</Link> — triaged events, sortable by urgency</li>
        <li><Link href="/dashboard">Dashboard</Link> — queue backlog, parse-failure rate, monthly cost</li>
        <li><Link href="/sources">Sources</Link> — per-source health and pause state</li>
        <li><Link href="/health">Health</Link> — system health snapshot</li>
      </ul>

      <h2>Architectural ground rules (don't break these)</h2>
      <ul>
        <li>Anthropic SDK lives in <code>lib/llm/gateway.ts</code> only. Import <code>runTriageInference()</code> elsewhere.</li>
        <li>Inference workers claim queue rows with <code>FOR UPDATE SKIP LOCKED</code>.</li>
        <li>Auto-merge of Issues is forbidden. Correlation produces suggestions; HITL decides.</li>
        <li>HITL correction must record a reason classification — never optional.</li>
        <li>Architectural decisions go in <code>docs/adr/</code> before code lands.</li>
      </ul>
    </div>
  );
}
