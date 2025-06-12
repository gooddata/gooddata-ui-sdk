#!/usr/bin/env node
// (C) 2021-2024 GoodData Corporation

/*
Export identifiers of metadata objects to file current_reference_workspace_objects.ts
 */

import { execSync } from "child_process";

import { TIGER_FIXTURE_CATALOG } from "./constant.js";

export function exportCatalogTiger(
    host,
    projectId,
    tiger_api_token,
    outputFile = TIGER_FIXTURE_CATALOG["goodsales"], // NOTE: we support this only for goodsales
) {
    execSync(
        `export TIGER_API_TOKEN="${tiger_api_token}" && npx gdc-catalog-export --accept-untrusted-ssl --hostname "${host}" --workspace-id "${projectId}" --catalog-output "${outputFile}"`,
        { stdio: "inherit" },
    );
}
