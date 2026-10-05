#!/usr/bin/env bash
# Usage: tools/update-resume.sh <resume.pdf | resume.md | resume.zip>
# Publishes the given resume as resume/Vikas_Das_Resume.pdf and bumps the
# cache-busting version on the site's download links.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/resume"
OUT_PDF="$OUT_DIR/Vikas_Das_Resume.pdf"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

[[ $# -eq 1 && -f "$1" ]] || { echo "usage: $0 <resume.pdf|.md|.zip>" >&2; exit 1; }

SOURCE="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
mkdir -p "$OUT_DIR"

if [[ "$SOURCE" == *.zip ]]; then
  unzip -q "$SOURCE" -d "$WORK/zip"
  FOUND="$(find "$WORK/zip" -type f \( -iname '*.pdf' -o -iname '*.md' \) ! -path '*/__MACOSX/*' | sort | head -1)"
  [[ -n "$FOUND" ]] || { echo "no .pdf or .md found inside $SOURCE" >&2; exit 1; }
  SOURCE="$FOUND"
fi

case "$SOURCE" in
  *.pdf|*.PDF)
    cp "$SOURCE" "$OUT_PDF"
    ;;
  *.md)
    python3 "$ROOT/tools/resume_to_html.py" "$SOURCE" "$WORK/resume.html"
    "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
      --print-to-pdf="$OUT_PDF" "file://$WORK/resume.html" 2>/dev/null
    ;;
  *)
    echo "unsupported file type: $SOURCE" >&2; exit 1
    ;;
esac

VERSION="$(date +%Y%m%d%H%M%S)"
sed -i '' -E "s#href=\"resume/Vikas_Das_Resume\.pdf(\?v=[0-9]+)?\"#href=\"resume/Vikas_Das_Resume.pdf?v=$VERSION\"#g" "$ROOT/index.html"
sed -i '' -E "s#(<span data-resume-updated>)[^<]*#\1$(date '+%b %Y')#" "$ROOT/index.html"

echo "Resume published to $OUT_PDF (version $VERSION)"
echo "Next: git add resume index.html && git commit -m 'Update resume' && git push"
