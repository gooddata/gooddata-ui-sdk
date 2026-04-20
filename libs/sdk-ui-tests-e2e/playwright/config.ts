// (C) 2026 GoodData Corporation

import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

import {
    BACKEND_HOST,
    GOODMOCK_HOST,
    type IFeatureHubEnvironment,
    createTest,
    getBaseUrl,
} from "@gooddata/sdk-e2e-utils";
import recordings from "@gooddata/sdk-ui-tests-reference-workspace/recordings_workspace" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const BASE_URL = getBaseUrl("http://gooddata-ui-sdk-scenarios:9500");
export const API_TOKEN = process.env["TIGER_API_TOKEN"] ?? "";

const RECORDINGS_DIR = resolve(__dirname, "../recordings/mappings/TIGER");

export function getMappingPath(specName: string): string {
    return join(RECORDINGS_DIR, `mapping-${specName}.spec.ts.json`);
}

const FEATURE_HUB_RESPONSE = [
    {
        id: "d2f33050-c46b-491e-82a1-17daba57a0a8",
        features: [
            {
                id: "d154cf37-9ffe-4cae-b892-017ff3429a8f",
                key: "enableNewPivotTable",
                l: false,
                version: 42,
                type: "BOOLEAN",
                value: true,
                strategies: [],
            },
            {
                id: "d154cf37-9ffe-4cae-b892-017ff3429a7c",
                key: "dashboardEditModeDevRollout",
                l: false,
                version: 42,
                type: "BOOLEAN",
                value: true,
                strategies: [],
            },
            {
                id: "d154cf37-9ffe-4cae-b892-123678340327",
                key: "enableWidgetIdentifiersRollout",
                l: false,
                version: 42,
                type: "BOOLEAN",
                value: true,
                strategies: [],
            },
            {
                id: "3d6febf7-430f-44df-a537-2436e2e07520",
                key: "enableDateFilterIdentifiersRollout",
                l: false,
                type: "BOOLEAN",
                value: true,
                version: 2,
            },
            {
                id: "64b7b92c-6721-461d-a8fb-52664f6ef219",
                key: "enableNewExecutorFlow",
                l: false,
                version: 4,
                type: "BOOLEAN",
                value: true,
            },
            {
                id: "e5f9bdd6-4f89-46be-84af-37f59548b33b",
                key: "enableExecutionCancelling",
                l: false,
                version: 2,
                type: "BOOLEAN",
                value: true,
                v: "0d2K",
            },
            {
                id: "78538cca-c3db-43a3-ac43-eb385b1ebea8",
                key: "enableEmptyDateValuesFilter",
                l: false,
                version: 13,
                type: "BOOLEAN",
                value: true,
                v: "NsVT",
            },
        ],
    },
] satisfies IFeatureHubEnvironment[];

export const test = createTest({
    goodmock: {
        host: GOODMOCK_HOST,
        backendHost: BACKEND_HOST,
        baseUrl: BASE_URL,
        getMappingPath,
        workspaceIdMappings: {
            sourceWorkspaceId: process.env["TEST_WORKSPACE_ID"] ?? "",
            targetWorkspaceId: recordings.workspaceId,
        },
    },
    featureHubResponse: FEATURE_HUB_RESPONSE,
});
