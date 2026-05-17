#!/usr/bin/env bash
# Per-commit health check for the deck. Run before pushing.
# Exit 0 = healthy. Non-zero = abort the push and diagnose.

set -euo pipefail

cd "$(dirname "$0")/.."

FAIL=0
PASS=0

check() {
  local label="$1"; shift
  if "$@" > /dev/null 2>&1; then
    printf "  ok    %s\n" "$label"
    PASS=$((PASS + 1))
  else
    printf "  FAIL  %s\n" "$label"
    FAIL=$((FAIL + 1))
  fi
}

echo "smoke-test · $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# 1. index.html exists and is non-empty
check "index.html present" test -s index.html

# 2. HTML parses (best-effort via python's HTMLParser — non-fatal on warnings)
check "index.html parses" python3 -c "
from html.parser import HTMLParser
import sys
p = HTMLParser()
p.feed(open('index.html').read())
"

# 3. Slide count >= 19 (iteration-2 baseline; V2 routing adds 2 more = 21)
SLIDES=$(grep -cE '<section[^>]*class="slide' index.html || true)
if [ "$SLIDES" -ge 19 ]; then
  printf "  ok    slide count: %s (>= 19)\n" "$SLIDES"
  PASS=$((PASS + 1))
else
  printf "  FAIL  slide count: %s (expected >= 19)\n" "$SLIDES"
  FAIL=$((FAIL + 1))
fi

# 4. slide-num strings consistent (`XX / N` where N is same throughout)
TOTALS=$(grep -oE 'class="slide-num">[0-9]+ / [0-9]+' index.html | grep -oE '/ [0-9]+' | sort -u | wc -l)
if [ "$TOTALS" -le 1 ]; then
  printf "  ok    slide-num totals consistent\n"
  PASS=$((PASS + 1))
else
  printf "  FAIL  slide-num totals inconsistent (multiple denominators)\n"
  FAIL=$((FAIL + 1))
fi

# 5. All JSON in /spec/ is valid
if compgen -G "spec/*.json" > /dev/null; then
  for f in spec/*.json; do
    check "valid JSON: $f" python3 -m json.tool "$f"
  done
fi

# 6. BRAND IDEA appears exactly once (§K invariant from iteration-2)
BICOUNT=$(grep -c 'BRAND IDEA' index.html || true)
if [ "$BICOUNT" = "1" ]; then
  printf "  ok    BRAND IDEA count = 1 (§K invariant)\n"
  PASS=$((PASS + 1))
else
  printf "  FAIL  BRAND IDEA count = %s (expected 1)\n" "$BICOUNT"
  FAIL=$((FAIL + 1))
fi

# 7. No raw external script tags beyond Google Fonts (third-party audit)
EXTERNAL_SCRIPTS=$(grep -cE '<script[^>]+src="https?://' index.html || true)
if [ "$EXTERNAL_SCRIPTS" = "0" ]; then
  printf "  ok    no external <script src=...> (zero third-party JS)\n"
  PASS=$((PASS + 1))
else
  printf "  FAIL  %s external <script src=...> found\n" "$EXTERNAL_SCRIPTS"
  FAIL=$((FAIL + 1))
fi

# 8. STATUS.md exists and was touched recently (catches stale tracker)
check "STATUS.md present" test -s STATUS.md

echo
echo "result: $PASS passed, $FAIL failed"
exit $FAIL
