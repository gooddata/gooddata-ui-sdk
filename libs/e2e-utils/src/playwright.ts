// (C) 2026 GoodData Corporation

import { type TestDetails, test } from "@playwright/test";

import {
    GoodmockMode,
    type IWorkspaceIdMapping,
    goodmockMode as getGoodmockMode,
    loadMappings,
    resetMappings,
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

        const goodmockMode = getGoodmockMode();

        let suite = fn;
        if (goodmockHost && goodmockMode !== GoodmockMode.Proxy) {
            suite = () => {
                test.beforeAll(async () => {
                    await resetMappings(goodmockHost);
                    if (goodmockMode === GoodmockMode.Record) {
                        await startRecording(goodmockHost, backendHost);
                    } else if (goodmockMode === GoodmockMode.Replay) {
                        await loadMappings(goodmockHost, getMappingPath(specName));
                    }
                });

                test.afterAll(async () => {
                    if (goodmockMode === GoodmockMode.Record) {
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

                // TODO: When this is supported in goodmock, uncomment this block
                // test.beforeEach(async () => {
                //     await resetScenarios(goodmockHost);
                // });

                fn(); // user's test.beforeAll/beforeEach calls stack on top naturally
            };
        }

        if (details) {
            // oxlint-disable-next-line playwright/valid-describe-callback
            test.describe(suiteName, details, suite);
        } else {
            // oxlint-disable-next-line playwright/valid-describe-callback
            test.describe(suiteName, suite);
        }
    }

    return describe;
}
