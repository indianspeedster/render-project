#!/usr/bin/env bash
# Decode a Google-Drive download (saved tool-result JSON) into a docx, convert it
# to a styled chapter page under <work>/<slug>/, and update texts.json.
#
# Usage:
#   ./import-chapter.sh <tool-result.json> <work-slug> <ch-slug> <n> "<Title>" "<Title SA>"
#
# The JSON has schema {content: <base64 docx>, id, mimeType, title}.

set -euo pipefail

if [ "$#" -lt 4 ]; then
  echo "Usage: $0 <tool-result.json> <work-slug> <ch-slug> <n> [\"<Title>\"] [\"<Title SA>\"]" >&2
  exit 1
fi

json="$1"; work="$2"; slug="$3"; n="$4"; title="${5:-}"; title_sa="${6:-}"
here="$(cd "$(dirname "$0")" && pwd)"

# Derive chapter labels from the number when not supplied.
if [ -z "$title" ]; then title="Chapter $n"; fi
if [ -z "$title_sa" ]; then
  dev="$(python3 -c "import sys;print(str(int(sys.argv[1])).translate(str.maketrans('0123456789','०१२३४५६७८९')))" "$n")"
  title_sa="अध्यायः $dev"
fi

tmp_docx="$(mktemp --suffix=.docx)"
tmp_body="$(mktemp)"
trap 'rm -f "$tmp_docx" "$tmp_body"' EXIT

jq -r '.content' "$json" | base64 -d > "$tmp_docx"

mkdir -p "$here/$work/$slug"
pandoc "$tmp_docx" -f docx -t html --extract-media="$here/$work/$slug" -o "$tmp_body"

python3 "$here/build.py" page \
  --work "$work" --slug "$slug" --n "$n" \
  --title "$title" --title-sa "$title_sa" \
  --body "$tmp_body"

echo "Imported $work/$slug (ch $n)"
