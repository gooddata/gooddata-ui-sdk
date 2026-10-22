#!/usr/bin/env bash
# (C) 2026 GoodData Corporation
# Point a version's API reference links at another version's reference.
#
# Usage: relink-api-reference.sh <content-dir> <from-dirpath> <to-dirpath>
#
# build-api-reference-versions.sh publishes a reference only for the newest versions and removes it
# from older ones. Their guides still link it (relref "/<from>/api-reference/..."), which would fail
# the build with REF_NOT_FOUND. This rewrites each such link in <content-dir>/<from>/**/*.md to
# /<to>/api-reference/..., keeping the anchor. When <to> has no such page (a symbol that was removed
# since), the link goes to its package page, or to the reference home.
set -euo pipefail

CONTENT_DIR=${1:?usage: relink-api-reference.sh <content-dir> <from-dirpath> <to-dirpath>}
FROM=${2:?usage: relink-api-reference.sh <content-dir> <from-dirpath> <to-dirpath>}
TO=${3:?usage: relink-api-reference.sh <content-dir> <from-dirpath> <to-dirpath>}
[ -d "$CONTENT_DIR/$FROM" ] || { echo "[relink-api-reference] ERROR: $CONTENT_DIR/$FROM not found" >&2; exit 1; }
[ -d "$CONTENT_DIR/$TO/api-reference" ] || { echo "[relink-api-reference] ERROR: $CONTENT_DIR/$TO/api-reference not found" >&2; exit 1; }

counts=$(FROM=$FROM TO=$TO REFROOT=$CONTENT_DIR/$TO/api-reference \
  find "$CONTENT_DIR/$FROM" -name '*.md' -exec perl -0pi -e '
    BEGIN { $n = 0 }
    sub target {
      my ($rest) = @_;
      my ($path, $anchor) = $rest =~ /^([^#]*)(#.*)?$/;
      $anchor //= "";
      my $root = $ENV{REFROOT};
      (my $bare = $path) =~ s{/$}{};
      if ($bare ne "") {
        for my $c ($path, "$bare.md", "$bare/_index.md") {
          return $path . $anchor if -f "$root/$c";
        }
      }
      my ($pkg) = $path =~ m{^([^/]+)};
      return "$pkg/" if defined $pkg && -f "$root/$pkg/_index.md";
      return "";
    }
    $n += s{(\b(?:rel)?ref\s+")/\Q$ENV{FROM}\E/api-reference/([^"]*)"}{$1 . "/$ENV{TO}/api-reference/" . target($2) . "\""}ge;
    END { print STDERR "$n\n" }
  ' {} + 2>&1 > /dev/null)
total=$(echo "$counts" | awk '{ s += $1 } END { print s + 0 }')
echo "[relink-api-reference] $FROM: $total reference links now point at $TO"
