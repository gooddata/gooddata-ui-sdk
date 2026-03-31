# (C) 2026 GoodData Corporation
#
# Playwright image with pre-bundled e2e test code.
# Built by the pre-build job so shard runners only need docker compose up.

FROM 020413372491.dkr.ecr.us-east-1.amazonaws.com/pullthrough/mcr.microsoft.com/playwright:v1.58.2-noble

WORKDIR /app

# Install @playwright/test so bundled code can require it at runtime
RUN npm install --no-save @playwright/test@1.58.2 pdf-parse@1.1.4

# Compare JSON fixture files
COPY playwright/fixtures ./playwright/fixtures

# Bundled test code (Rolldown output)
COPY dist ./playwright

USER root
