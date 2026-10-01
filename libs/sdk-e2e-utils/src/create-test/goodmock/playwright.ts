// (C) 2026 GoodData Corporation

import { type test } from "@playwright/test";

import { loadMappings, resetMappings, startRecording } from "./admin.js";
import { GoodmockMode, goodmockMode as getGoodmockMode } from "./mode.js";
import { snapshotAndSaveRecording } from "./snapshot/snapshot-and-save-recording.js";
import { type IGoodmockOptions } from "./types.js";

/** Goodmock lifecycle hooks */
export function registerGoodmockHooks(
    testInstance: typeof test,
    gm: IGoodmockOptions,
    specName: string,
): void {
    const goodmockMode = getGoodmockMode();
    if (goodmockMode === GoodmockMode.Proxy) {
        return;
    }

    testInstance.beforeAll(async () => {
        await resetMappings(gm.host);
        if (goodmockMode === GoodmockMode.Record) {
            await startRecording(gm.host, gm.backendHost);
        } else if (goodmockMode === GoodmockMode.Replay) {
            await loadMappings(gm.host, gm.getMappingPath(specName));
        }
    });

    testInstance.afterAll(async () => {
        if (goodmockMode === GoodmockMode.Record) {
            await snapshotAndSaveRecording(gm.host, gm.getMappingPath(specName), {
                workspaceIdMappings: gm.workspaceIdMappings,
                backendHost: gm.backendHost,
                baseUrl: gm.baseUrl,
                secretMappings: gm.secretMappings,
                leakPatterns: gm.leakPatterns,
                sanitizeMappings: gm.sanitizeMappings,
            });
        }
        await resetMappings(gm.host);
    });

    // TODO: When this is supported in goodmock, uncomment this block
    // testInstance.beforeEach(async () => {
    //     await resetScenarios(gm.host);
    // });
}
