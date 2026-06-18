# (C) 2026 GoodData Corporation

# test 1

#
# Playwright image with pre-bundled e2e test code.
# Built by the pre-build job so shard runners only need docker compose up.

FROM 020413372491.dkr.ecr.us-east-1.amazonaws.com/pullthrough/mcr.microsoft.com/playwright:v1.61.0-noble@sha256:d0db7b8fc460af57a7dafb193d8cea52de84d7c2e6eb1e1cf49b974e96a42995

WORKDIR /app

# Install @playwright/test so bundled code can require it at runtime
RUN npm install --no-save @playwright/test@1.61.0

# Compare JSON fixture files
COPY playwright/fixtures ./playwright/fixtures

# Bundled test code (Rolldown output, packed by _phase:pack-build)
ADD sdk-ui-tests-e2e.tgz ./playwright/

USER root
