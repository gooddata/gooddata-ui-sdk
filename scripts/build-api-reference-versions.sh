#!/usr/bin/env bash
# (C) 2026 GoodData Corporation
# Versioned (public) build: give the newest N versions their own API reference, each generated
# from its own release branch, and drop the reference from every older version.
#
# Usage: build-api-reference-versions.sh <content-dir>
#   content-dir  versioned_docs (filled by generate.sh), relative to sdk/docs
#
# What it does, in order:
#   1. latest, only in a preview build (generate.sh keep_master, which leaves a .keep_master
#      marker in <content-dir>): latest/ is then this checkout's docs, so it gets the reference
#      from this checkout's SDK model, as build-api-reference.sh does. In production latest/ is
#      the newest release and step 2 fills it.
#   2. The first API_REFERENCE_VERSIONS numbered entries of config/public/params.toml ([[versions]],
#      newest first, kept by the release bot): for each, a git worktree of <remote>/rel/<version>,
#      rush install + build + api-extractor there (the CI build cache makes this mostly a cache
#      restore: the release already built that branch), then the generator with that version's
#      model and that version's guides, placed into <content-dir>/<dirpath>/ only. In a preview
#      build the entry whose dirpath is latest (master holds that folder) goes into its own
#      <version>/ folder, where generate.sh left that release.
#   3. Every other version folder loses its api-reference/, so no old copy is published. Its
#      guides' links into it (relref "/<dirpath>/api-reference/...") are pointed at the newest
#      version's reference instead, so the build doesn't fail on them; a symbol the newest version
#      no longer has links its package page, or the reference home. The theme's old-version
#      banner then says that API links open the newest version (_partials/version-banner.html).
#
# One version costs a worktree, a rush install and a (cached) build: a few minutes in CI. The
# newest one (latest) must succeed; an older one that fails is skipped with a warning, so an
# expired build cache or a broken old branch never blocks a release deploy.
#
# Env:
#   API_REFERENCE_VERSIONS  how many numbered versions get a reference; default 6
#   REMOTE                  git remote with the rel/* branches; default origin
#   SDK_LIBS_DIR            this checkout's api model, for a preview build's latest; default sdk/libs
#   WORK_DIR                scratch space for worktrees and generator output; default mktemp
#   RUSH_PNPM_STORE_PATH    pnpm store for the worktrees' installs; default this checkout's
#                           common/temp/pnpm-store (restored by set-up-rush), so packages are reused
set -euo pipefail

CONTENT_ARG=${1:?usage: build-api-reference-versions.sh <content-dir>}
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
DOCS_DIR=$(cd "$SCRIPT_DIR/../docs" && pwd)
REPO_ROOT=$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)
CONTENT_DIR=$DOCS_DIR/$CONTENT_ARG
DATA_DIR=$DOCS_DIR/data
PARAMS_FILE=$DOCS_DIR/config/public/params.toml
MARKER_TEMPLATE=$DOCS_DIR/content/en/latest/api-reference/_index.md
COUNT=${API_REFERENCE_VERSIONS:-6}
REMOTE=${REMOTE:-origin}

[ -d "$CONTENT_DIR" ] || { echo "[api-reference-versions] ERROR: content dir not found: $CONTENT_DIR" >&2; exit 1; }
[ -f "$PARAMS_FILE" ] || { echo "[api-reference-versions] ERROR: $PARAMS_FILE not found" >&2; exit 1; }

if [ -z "${WORK_DIR:-}" ]; then
  WORK_DIR=$(mktemp -d)
  trap 'rm -rf "$WORK_DIR"; git -C "$REPO_ROOT" worktree prune' EXIT
fi
mkdir -p "$WORK_DIR"
export RUSH_PNPM_STORE_PATH=${RUSH_PNPM_STORE_PATH:-$REPO_ROOT/common/temp/pnpm-store}

log() { echo "[api-reference-versions] $*"; }

# generate <sdk-libs-dir> <dirpath> <label>: generator output for one version -> $WORK_DIR/out-<dirpath>
generate() {
  local libs=$1 dirpath=$2 label=$3 out=$WORK_DIR/out-$2
  rm -rf "$out"
  (cd "$DOCS_DIR" && SDK_LIBS_DIR=$libs OUT_DIR=$out GUIDE_CONTENT_DIR=$CONTENT_DIR/$dirpath \
    ARTIFACT_VERSION=$label npm run -s api-reference:generate) || return 1
  PLACE_ONLY=$dirpath "$SCRIPT_DIR/place-api-reference.sh" "$out" "$CONTENT_DIR" "$DATA_DIR"
}

# source_ref <dirpath> <git ref>: where the version's "Source:" pills point (_partials/api-data.html)
source_ref() {
  local dir=$DATA_DIR/api_versions/${1//./_}
  mkdir -p "$dir"
  printf '{ "ref": "%s" }\n' "$2" > "$dir/source.json"
}

# ensure_marker <dirpath>: release branches from before the in-site reference have no
# api-reference/_index.md; give them this checkout's, so the section has a title and weight.
ensure_marker() {
  local marker=$CONTENT_DIR/$1/api-reference/_index.md
  [ -f "$marker" ] && return
  mkdir -p "$(dirname "$marker")"
  cp "$MARKER_TEMPLATE" "$marker"
}

# rush <args>: install-run-rush, where "succeeded with warnings" counts as success. Rush exits 1
# on warnings, and an old branch can carry harmless ones (rel/11.59: a bundler timing note from
# react-app-template), which must not skip its reference.
rush() {
  local out=$WORK_DIR/rush.log status=0
  node common/scripts/install-run-rush.js "$@" 2>&1 | tee "$out" || status=$?
  [ "$status" -eq 0 ] && return 0
  grep -q "Operations succeeded with warnings" "$out" && return 0
  return "$status"
}

# build_version <version> <dirpath>: that release branch's model, generated and placed.
# It runs as an `if` condition, where bash ignores set -e, so every step checks its own status.
build_version() {
  local version=$1 dirpath=$2 branch=$REMOTE/rel/$1 wt=$WORK_DIR/rel-$1
  git -C "$REPO_ROOT" rev-parse --verify --quiet "$branch^{commit}" > /dev/null \
    || { echo "[api-reference-versions] no branch $branch" >&2; return 1; }
  log "$dirpath ($version) <- $branch"
  rm -rf "$wt"
  git -C "$REPO_ROOT" worktree add --detach "$wt" "$branch" > /dev/null || return 1
  (
    cd "$wt" || exit 1
    # set-up-rush does this for the main checkout; the worktree needs it for the S3 build cache.
    if [ "${RUSH_BUILD_CACHE_ENABLED:-}" = "1" ] && [ -f common/cache-templates/ci.build-cache.json ]; then
      cp common/cache-templates/ci.build-cache.json common/config/rush/build-cache.json || exit 1
    fi
    rush install --to subspace:sdk && rush build --to subspace:sdk && rush api-extractor --to subspace:sdk
  ) || return 1
  ensure_marker "$dirpath" || return 1
  generate "$wt/sdk/libs" "$dirpath" "$version" || return 1
  source_ref "$dirpath" "rel/$version" || return 1
  git -C "$REPO_ROOT" worktree remove --force "$wt"
}

built=()
site_data=""

# The folder holding this checkout's own docs: latest in a preview build, none in production.
master_dir=""
[ -f "$CONTENT_DIR/.keep_master" ] && master_dir=latest

# 1. a preview build's latest, from this checkout
if [ -n "$master_dir" ] && [ -f "$CONTENT_DIR/$master_dir/api-reference/_index.md" ]; then
  libs=${SDK_LIBS_DIR:-$REPO_ROOT/sdk/libs}
  log "$master_dir (master) <- $libs"
  generate "$libs" "$master_dir" "Next"
  source_ref "$master_dir" master
  built+=("$master_dir")
fi

# 2. the newest numbered versions, each from its own branch. params.toml is written by the release
# bot, one key per line inside each [[versions]] block, so a line scan reads it reliably.
entries=$(awk '
  /^\[\[versions\]\]/ { if (v != "") print v "\t" d; v = ""; d = ""; next }
  /^\[/ { if (v != "") print v "\t" d; v = ""; d = ""; next }
  /^[[:space:]]*version[[:space:]]*=/ { v = $0; sub(/^[^"]*"/, "", v); sub(/".*$/, "", v) }
  /^[[:space:]]*dirpath[[:space:]]*=/ { d = $0; sub(/^[^"]*"/, "", d); sub(/".*$/, "", d) }
  END { if (v != "") print v "\t" d }
' "$PARAMS_FILE" | awk -F'\t' '$1 ~ /^[0-9]+\.[0-9]+$/' | head -n "$COUNT")

first=1
while IFS=$'\t' read -r version dirpath; do
  [ -n "$version" ] || continue
  # Preview build: master holds latest/, the release this entry names kept its <version>/ folder.
  if [ -n "$master_dir" ] && [ "$dirpath" = "$master_dir" ]; then dirpath=$version; fi
  if [ ! -d "$CONTENT_DIR/$dirpath" ]; then
    log "WARNING: $dirpath ($version) is not in $CONTENT_ARG, skipped"
    first=0
    continue
  fi
  if build_version "$version" "$dirpath"; then
    built+=("$dirpath")
    [ -n "$site_data" ] || site_data=$dirpath
  elif [ "$first" -eq 1 ]; then
    echo "[api-reference-versions] ERROR: the newest version ($version) failed" >&2
    exit 1
  else
    log "WARNING: $dirpath ($version) failed; published without an API reference"
    git -C "$REPO_ROOT" worktree remove --force "$WORK_DIR/rel-$version" 2> /dev/null || true
  fi
  first=0
done <<< "$entries"

# The site-wide data (the fallback in api-data.html, used by versions without their own reference):
# the newest numbered version, which is where their links now point; a preview build's latest only
# when no numbered version was built.
[ -n "$site_data" ] || { for b in "${built[@]:-}"; do [ -n "$master_dir" ] && [ "$b" = "$master_dir" ] && site_data=$master_dir; done; }
if [ -n "$site_data" ]; then
  cp "$DATA_DIR/api_versions/${site_data//./_}/api_refs.json" "$DATA_DIR/api_versions/${site_data//./_}/api_props.json" "$DATA_DIR/"
fi

# 3. every other version folder: no reference, and its links go to the newest numbered version
newest=""
for b in "${built[@]:-}"; do [ -n "$b" ] && [ "$b" != "$master_dir" ] && { newest=$b; break; }; done
for dir in "$CONTENT_DIR"/*/api-reference; do
  [ -d "$dir" ] || continue
  dirpath=$(basename "$(dirname "$dir")")
  keep=0
  for b in "${built[@]:-}"; do [ "$b" = "$dirpath" ] && keep=1; done
  if [ "$keep" -eq 0 ]; then
    log "$dirpath: not one of the newest $COUNT, API reference removed"
    rm -rf "$dir"
    if [ -n "$newest" ]; then "$SCRIPT_DIR/relink-api-reference.sh" "$CONTENT_DIR" "$dirpath" "$newest"; fi
  fi
done

log "built: ${built[*]:-none}"
