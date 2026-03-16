// (C) 2026 GoodData Corporation

import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

import { BACKEND_HOST, GOODMOCK_HOST, createDescribe, getBaseUrl } from "@gooddata/e2e-utils";
import recordings from "@gooddata/sdk-ui-tests-reference-workspace/recordings_workspace" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const BASE_URL = getBaseUrl("http://gooddata-ui-sdk-scenarios:9500");
export const API_TOKEN = process.env["TIGER_API_TOKEN"] ?? "";

const RECORDINGS_DIR = resolve(__dirname, "../recordings/mappings/TIGER");

export function getMappingPath(specName: string): string {
    return join(RECORDINGS_DIR, `mapping-${specName}.spec.ts.json`);
}

export const describe = createDescribe(GOODMOCK_HOST, BACKEND_HOST, getMappingPath, {
    sourceWorkspaceId: process.env["TEST_WORKSPACE_ID"] ?? "",
    targetWorkspaceId: recordings.workspaceId,
});
