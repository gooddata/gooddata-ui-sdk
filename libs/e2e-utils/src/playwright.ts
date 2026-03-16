// (C) 2026 GoodData Corporation

import { type TestDetails, test } from "@playwright/test";

import {
    type IWorkspaceIdMapping,
    isRecordMode,
    loadMappings,
    resetMappings,
    resetScenarios,
    snapshotAndSaveRecording,
    startRecording,
} from "./goodmock.js";

export function createDescribe(
    goodmockHost: string,
    backendHost: string,
    getMappingPath: (specFile: string) => string,
    workspaceIdMappings?: IWorkspaceIdMapping | IWorkspaceIdMapping[],
    baseUrl?: string,
) {
    function describe(suiteName: string, specName: string, fn: () => void): void;

    function describe(suiteName: string, specName: string, details: TestDetails, fn: () => void): void;

    function describe(
        suiteName: string,
        specName: string,
        detailsOrFn: TestDetails | (() => void),
        func?: () => void,
    ) {
        const hasDetails = typeof detailsOrFn !== "function";
        const details = hasDetails ? (detailsOrFn as TestDetails) : undefined;
        const fn = hasDetails ? (func as () => void) : (detailsOrFn as () => void);

        let suite = fn;
        if (goodmockHost) {
            suite = () => {
                test.beforeAll(async () => {
                    await resetMappings(goodmockHost);
                    if (isRecordMode()) {
                        await startRecording(goodmockHost, backendHost);
                    } else {
                        await loadMappings(goodmockHost, getMappingPath(specName));
                    }
                });

                test.afterAll(async () => {
                    if (isRecordMode()) {
                        await snapshotAndSaveRecording(
                            goodmockHost,
                            getMappingPath(specName),
                            workspaceIdMappings,
                            backendHost,
                            baseUrl,
                        );
                    }
                    await resetMappings(goodmockHost);
                });

                test.beforeEach(async () => {
                    await resetScenarios(goodmockHost);
                });

                fn(); // user's test.beforeAll/beforeEach calls stack on top naturally
            };
        }

        if (details) {
            test.describe(suiteName, details, suite);
        } else {
            test.describe(suiteName, suite);
        }
    }

    return describe;
}
