#!/usr/bin/env bash
# Per-commit health check for the handbook. Run before pushing.
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

# 1. Core files present
check "index.html present" test -s index.html
check "app.js present" test -s app.js
check "styles.css present" test -s styles.css
check "sw.js present" test -s sw.js

# 2. HTML parses
check "index.html parses" python3 -c "
from html.parser import HTMLParser
HTMLParser().feed(open('index.html').read())
"

# 3. JSON data files valid
for f in data/*.json spec/*.json; do
  [ -f "$f" ] || continue
  check "valid JSON: $f" python3 -m json.tool "$f"
done

# 4. Data file content sanity (counts match deck claims)
CAPS=$(python3 -c "import json; print(len(json.load(open('data/capabilities.json'))['capabilities']))" 2>/dev/null || echo 0)
[ "$CAPS" = "12" ] && { printf "  ok    capabilities count: 12\n"; PASS=$((PASS+1)); } || { printf "  FAIL  capabilities count: %s (expected 12)\n" "$CAPS"; FAIL=$((FAIL+1)); }

SCENS=$(python3 -c "import json; print(len(json.load(open('data/scenarios.json'))['scenarios']))" 2>/dev/null || echo 0)
[ "$SCENS" = "10" ] && { printf "  ok    scenarios count: 10\n"; PASS=$((PASS+1)); } || { printf "  FAIL  scenarios count: %s (expected 10)\n" "$SCENS"; FAIL=$((FAIL+1)); }

BARS=$(python3 -c "import json; print(len(json.load(open('data/bars.json'))['anchors']))" 2>/dev/null || echo 0)
[ "$BARS" = "12" ] && { printf "  ok    BARS anchors illustrated: 12\n"; PASS=$((PASS+1)); } || { printf "  FAIL  BARS anchors: %s (expected 12)\n" "$BARS"; FAIL=$((FAIL+1)); }

MODS=$(python3 -c "import json; print(len(json.load(open('data/modules.json'))['modules']))" 2>/dev/null || echo 0)
[ "$MODS" = "9" ] && { printf "  ok    modules count: 9\n"; PASS=$((PASS+1)); } || { printf "  FAIL  modules count: %s (expected 9)\n" "$MODS"; FAIL=$((FAIL+1)); }

TIERS=$(python3 -c "import json; print(len(json.load(open('data/tiers.json'))['tiers']))" 2>/dev/null || echo 0)
[ "$TIERS" = "6" ] && { printf "  ok    tiers count: 6\n"; PASS=$((PASS+1)); } || { printf "  FAIL  tiers count: %s (expected 6)\n" "$TIERS"; FAIL=$((FAIL+1)); }

# 5. No external script src (third-party JS audit)
EXTERNAL=$(grep -cE '<script[^>]+src="https?://' index.html || true)
[ "$EXTERNAL" = "0" ] && { printf "  ok    no external <script src=...>\n"; PASS=$((PASS+1)); } || { printf "  FAIL  %s external script(s)\n" "$EXTERNAL"; FAIL=$((FAIL+1)); }

# 6. STATUS / AUDIT / CHANGELOG present
check "STATUS.md present" test -s STATUS.md
check "CHANGELOG.md present" test -s CHANGELOG.md
check "AUDIT.md present" test -s AUDIT.md

echo
echo "result: $PASS passed, $FAIL failed"
exit $FAIL
