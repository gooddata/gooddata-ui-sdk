#!/bin/bash

set -e
set -x

RPMDIR="$PWD/packages/artifacts"

if [ ! -z "$BUILD_NUMBER" ]; then
    git clean -fd
fi

rm -rf "$RPMDIR"
[ -f hiera.fragment.txt ] && rm -f hiera.fragment.txt
mkdir -p "$RPMDIR"

# In case of RPM build on different env than Component pipeline
if [ -n "$GDCVERSION" ]; then
    VERSION=$GDCVERSION
else
    VERSION=local
fi

# Archive whole git repo including .git
tar czf gooddata-react-components-web.tar.gz $(git ls-tree --name-only HEAD) .git

# Create RPM
rpmbuild -bb \
    --define "_rpmdir $RPMDIR" \
    --define "_builddir $PWD" \
    --define "_sourcedir $PWD" \
    --define "_rpmfilename %{NAME}-%{VERSION}-%{RELEASE}.%{ARCH}.rpm" \
    --define "gdcversion $VERSION" \
    specs/gooddata-react-components-web.spec
