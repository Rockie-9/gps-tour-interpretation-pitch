#!/usr/bin/env bash
# Promote a working eval run to the committed audit-runs archive.
# See eval/audit-runs/README.md for the file-name convention.
#
# Usage:
#   ./scripts/promote-eval-run.sh <event-tag> [source-file]
#
# Examples:
#   ./scripts/promote-eval-run.sh "deploy-$(date -u +%Y-%m-%d)-$(git rev-parse --short HEAD)"
#   ./scripts/promote-eval-run.sh "prompt-bump-v2-$(date -u +%Y-%m-%d)"
#
# If [source-file] is omitted, the most recent file in eval/runs/ is used.

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: $0 <event-tag> [source-file]" >&2
  exit 2
fi

EVENT_TAG="$1"
SOURCE_FILE="${2:-}"

if [[ -z "${SOURCE_FILE}" ]]; then
  SOURCE_FILE="$(ls -t eval/runs/*.json 2>/dev/null | head -n 1 || true)"
fi

if [[ -z "${SOURCE_FILE}" || ! -f "${SOURCE_FILE}" ]]; then
  echo "no source run found; provide a path explicitly or run \`npm run eval\` first" >&2
  exit 1
fi

DEST="eval/audit-runs/${EVENT_TAG}.json"
if [[ -e "${DEST}" ]]; then
  echo "refusing to overwrite ${DEST}" >&2
  exit 1
fi

cp -- "${SOURCE_FILE}" "${DEST}"
echo "promoted: ${SOURCE_FILE} -> ${DEST}"
echo "next: git add ${DEST} && git commit -m '[eval-audit] ${EVENT_TAG}'"
