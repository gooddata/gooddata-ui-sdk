#!/usr/bin/env bash
# Fill every <content-dir>/<version>/api-reference/ from a local generator output directory.
#
# Usage: place-api-reference.sh <artifact-dir> <content-dir> [data-dir]
#   artifact-dir  local directory holding api-reference/, api_refs.json and api_props.json (the generator's OUT_DIR)
#   content-dir   content/en (working tree build) or versioned_docs (release build)
#   data-dir      where api_refs.json and api_props.json go; default sdk/docs/data
#
# Env:
#   PLACE_ONLY    fill only the <content-dir>/<PLACE_ONLY>/ marker (e.g. 11.59). Used by
#                 build-api-reference-versions.sh, which runs this once per version with that
#                 version's own artifact.
#
# Data: <data-dir>/api_refs.json and api_props.json come from the first version placed
# (latest, then the numbered versions); with PLACE_ONLY they are left to the caller. Every placed version also gets its own copy in
# <data-dir>/api_versions/<version, dots as _>/, which the theme prefers for pages in that
# version (_partials/api-data.html), so a version's guides link its own reference.
#
# The committed <version>/api-reference/_index.md is the marker. Its frontmatter
# is kept; its body comes from the artifact. Placeholders in the artifact are
# rewritten to the real section path. A missing or malformed artifact dir fails
# the build without touching any marker.
set -euo pipefail

ARTIFACT_DIR=${1:?usage: place-api-reference.sh <artifact-dir> <content-dir> [data-dir]}
CONTENT_DIR=${2:?usage: place-api-reference.sh <artifact-dir> <content-dir> [data-dir]}
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
DATA_DIR=${3:-$SCRIPT_DIR/../docs/data}

REF_PLACEHOLDER='__API_REF_BASE__'
DOCS_PLACEHOLDER='__DOCS_BASE__'

[ -d "$ARTIFACT_DIR/api-reference" ] || { echo "[place-api-reference] ERROR: malformed artifact dir $ARTIFACT_DIR: missing api-reference/" >&2; exit 1; }
[ -f "$ARTIFACT_DIR/api-reference/_index.md" ] || { echo "[place-api-reference] ERROR: malformed artifact dir $ARTIFACT_DIR: missing api-reference/_index.md" >&2; exit 1; }
[ -f "$ARTIFACT_DIR/api_refs.json" ] || { echo "[place-api-reference] ERROR: malformed artifact dir $ARTIFACT_DIR: missing api_refs.json" >&2; exit 1; }
[ -f "$ARTIFACT_DIR/api_props.json" ] || { echo "[place-api-reference] ERROR: malformed artifact dir $ARTIFACT_DIR: missing api_props.json" >&2; exit 1; }

[ -d "$CONTENT_DIR" ] || { echo "[place-api-reference] ERROR: content dir not found: $CONTENT_DIR" >&2; exit 1; }

# Markers, ordered so the data file comes from latest, then the rest.
markers=()
while IFS= read -r m; do markers+=("$m"); done < <(
  find "$CONTENT_DIR" -mindepth 3 -maxdepth 3 -path '*/api-reference/_index.md' \
    | awk '{ v=$0; sub(/\/api-reference\/_index\.md$/, "", v); n=split(v, a, "/"); k=a[n];
             p = (k=="latest") ? 0 : 1; print p "\t" $0 }' \
    | sort -k1,1n -k2 | cut -f2-
)

if [ -n "${PLACE_ONLY:-}" ]; then
  only=()
  for m in "${markers[@]}"; do
    [ "$(basename "$(dirname "$(dirname "$m")")")" = "$PLACE_ONLY" ] && only+=("$m")
  done
  [ ${#only[@]} -eq 1 ] || { echo "[place-api-reference] ERROR: PLACE_ONLY=$PLACE_ONLY: no $CONTENT_DIR/$PLACE_ONLY/api-reference/_index.md marker" >&2; exit 1; }
  markers=("${only[@]}")
fi

if [ ${#markers[@]} -eq 0 ]; then
  case "$CONTENT_DIR" in
    */content/en|*/content/en/|content/en|content/en/)
      echo "[place-api-reference] ERROR: no api-reference/_index.md marker under $CONTENT_DIR (expected at least latest/api-reference/_index.md)" >&2
      exit 1 ;;
  esac
  echo "[place-api-reference] no api-reference/_index.md markers under $CONTENT_DIR, nothing to do"
  exit 0
fi

mkdir -p "$DATA_DIR"
data_written=0
work=$(mktemp -d "$CONTENT_DIR/.api-ref-stage.XXXXXX")
trap 'rm -rf "$work"' EXIT

for marker in "${markers[@]}"; do
  target_dir=$(dirname "$marker")               # .../<version>/api-reference
  version=$(basename "$(dirname "$target_dir")") # <version>
  ref_base="/$version/api-reference"
  docs_base="/$version"

  echo "[place-api-reference] $version <- $ARTIFACT_DIR"
  stage="$work/$version"
  mkdir -p "$stage"
  cp -R "$ARTIFACT_DIR/api-reference" "$stage/api-reference"
  cp "$ARTIFACT_DIR/api_refs.json" "$ARTIFACT_DIR/api_props.json" "$stage/"

  # Rewrite placeholders in every page and in the symbol index.
  find "$stage/api-reference" -name '*.md' -print0 \
    | xargs -0 perl -pi -e "s{\Q$REF_PLACEHOLDER\E}{$ref_base}g; s{\Q$DOCS_PLACEHOLDER\E}{$docs_base}g"
  perl -pi -e "s{\Q$REF_PLACEHOLDER\E}{$ref_base}g" "$stage/api_refs.json" "$stage/api_props.json"

  # Keep the committed frontmatter, take the artifact's body.
  committed_fm=$(awk 'NR==1 && $0!="---"{exit} NR==1{next} /^---$/{exit} {print}' "$marker")
  artifact_body=$(awk 'BEGIN{fm=0} NR==1 && $0=="---"{fm=1; next} fm==1 && /^---$/{fm=2; next} fm!=1{print}' "$stage/api-reference/_index.md")
  {
    printf -- '---\n%s\n---\n' "$committed_fm"
    printf '%s\n' "$artifact_body"
  } > "$stage/api-reference/_index.md"

  # Hand-written pages that live directly in api-reference/ (e.g. the versions
  # archive) are not in the artifact and must survive the swap. The generator
  # only ever emits _index.md plus one directory per package at this level, so
  # any other top-level *.md here is authored content.
  if [ -d "$target_dir" ]; then
    for authored in "$target_dir"/*.md; do
      [ -f "$authored" ] || continue
      name=$(basename "$authored")
      [ "$name" = "_index.md" ] && continue
      [ -e "$stage/api-reference/$name" ] && continue
      cp "$authored" "$stage/api-reference/$name"
    done
  fi

  rm -rf "$target_dir"
  mv "$stage/api-reference" "$target_dir"

  version_data="$DATA_DIR/api_versions/${version//./_}"
  mkdir -p "$version_data"
  cp "$stage/api_refs.json" "$stage/api_props.json" "$version_data/"

  # With PLACE_ONLY the caller picks which version's data becomes the site-wide copy.
  if [ "$data_written" -eq 0 ] && [ -z "${PLACE_ONLY:-}" ]; then
    cp "$stage/api_refs.json" "$DATA_DIR/api_refs.json"
    cp "$stage/api_props.json" "$DATA_DIR/api_props.json"
    data_written=1
    echo "[place-api-reference] api_refs.json, api_props.json <- $version"
  fi
done
