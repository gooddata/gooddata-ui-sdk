#!/bin/sh
# (C) 2023 GoodData Corporation

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
htmltest_version=0.14.0
htmltest_bin=$REPO_ROOT/bin/htmltest

# get htmltest if not found
if [ ! -f $htmltest_bin ] ; then
  echo "htmltest not found, downloading..."
  case "$(uname -s)" in
    Darwin*)
      os="macos"
      ;;
    Linux)
      os="linux"
      ;;
    *)
      echo "Unsupported OS"
      exit 1
      ;;
  esac
  tmpdir="$(mktemp -d)"
  wget -O $tmpdir/htmltest.tgz https://github.com/wjdp/htmltest/releases/download/v${htmltest_version}/htmltest_${htmltest_version}_${os}_amd64.tar.gz
  mkdir -p $REPO_ROOT/bin
  tar xzf $tmpdir/htmltest.tgz -C $REPO_ROOT/bin htmltest
  chmod +x $htmltest_bin
fi

"$htmltest_bin" "$@"