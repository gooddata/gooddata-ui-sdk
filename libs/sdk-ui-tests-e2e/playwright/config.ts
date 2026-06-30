// (C) 2026 GoodData Corporation

import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

import {
    BACKEND_HOST,
    GOODMOCK_HOST,
    type IFeatureHubEnvironment,
    createTest,
    getBaseUrl,
    getWorkspaceId,
} from "@gooddata/sdk-e2e-utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const BASE_URL = getBaseUrl("http://gooddata-ui-sdk-scenarios:9600");
export const API_TOKEN = process.env["TIGER_API_TOKEN"] ?? "";
export const DEFAULT_WORKSPACE_ID = "c76e0537d0614abb0027f7c992656b964922506f";
export const WORKSPACE_ID = getWorkspaceId(DEFAULT_WORKSPACE_ID);

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
            sourceWorkspaceId: WORKSPACE_ID,
            targetWorkspaceId: DEFAULT_WORKSPACE_ID,
        },
    },
    featureHubResponse: FEATURE_HUB_RESPONSE,
});
