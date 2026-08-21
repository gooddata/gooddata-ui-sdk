// (C) 2026 GoodData Corporation

// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
    PRELOAD_LINK_TIMEOUT_MS,
    createHostFederationPlugin,
    evictRemoteEntryLoadCache,
} from "../federationRuntimePlugin.js";

const GLOBAL_LOADING_REMOTE_ENTRY = "__GLOBAL_LOADING_REMOTE_ENTRY__";

type EntryCache = Record<string, unknown>;

const globals = globalThis as Record<string, unknown>;

function setEntryCache(value: EntryCache): void {
    globals[GLOBAL_LOADING_REMOTE_ENTRY] = value;
}

/**
 * Puts the global into the "Module Federation has not created its cache yet" state.
 *
 * `delete` alone does not do: `runtime-core`'s `global.js` installs the global with
 * `configurable: false`, so once anything in the worker has imported the MF runtime — which any
 * earlier test file in a non-isolated run may have done — the property can only be written, never
 * removed. Writing `undefined` is equivalent for the code under test, which treats a missing and an
 * undefined cache the same. Where the property is still removable it is removed rather than
 * blanked, so that a later first import of the runtime still creates the real cache: `global.js`
 * skips creating it when the key is already an own property, whatever its value.
 */
function clearEntryCache(): void {
    if (Reflect.getOwnPropertyDescriptor(globals, GLOBAL_LOADING_REMOTE_ENTRY)?.configurable === false) {
        globals[GLOBAL_LOADING_REMOTE_ENTRY] = undefined;
        return;
    }
    delete globals[GLOBAL_LOADING_REMOTE_ENTRY];
}

function getEntryCache(): EntryCache {
    return globals[GLOBAL_LOADING_REMOTE_ENTRY] as EntryCache;
}

const remoteInfo = {
    name: "gdc_metric_editor",
    entry: "/organization/remotes/gdc-metric-editor/remoteEntry.js",
};
const cacheKey = `${remoteInfo.name}:${remoteInfo.entry}`;

describe("federationRuntimePlugin", () => {
    let originalCache: unknown;
    let hadOwnCache = false;

    beforeEach(() => {
        hadOwnCache = Object.hasOwn(globals, GLOBAL_LOADING_REMOTE_ENTRY);
        originalCache = globals[GLOBAL_LOADING_REMOTE_ENTRY];
    });

    afterEach(() => {
        // Restore the exact prior state — the runtime's own cache is shared with everything else
        // running in this worker once isolation is off.
        if (hadOwnCache) {
            globals[GLOBAL_LOADING_REMOTE_ENTRY] = originalCache;
        } else {
            clearEntryCache();
        }
    });

    describe("evictRemoteEntryLoadCache", () => {
        it("leaves other remotes' cached entries alone", () => {
            const otherKey = "gdc_catalog:/organization/remotes/gdc-catalog/remoteEntry.js";
            setEntryCache({ [cacheKey]: "failed", [otherKey]: "loaded" });

            evictRemoteEntryLoadCache(remoteInfo);

            expect(getEntryCache()).toEqual({ [otherKey]: "loaded" });
        });

        it("is a no-op when module federation has not created its cache yet", () => {
            clearEntryCache();

            expect(() => evictRemoteEntryLoadCache(remoteInfo)).not.toThrow();
        });
    });

    describe("createHostFederationPlugin", () => {
        it("raises the preload link timeout above module federation's 20s default", () => {
            expect(createHostFederationPlugin().createLink?.({ url: "/some/chunk.js" })).toEqual({
                timeout: PRELOAD_LINK_TIMEOUT_MS,
            });
            expect(PRELOAD_LINK_TIMEOUT_MS).toBeGreaterThan(20_000);
        });

        it("keeps the cached entry promise when the remote entry loaded successfully", async () => {
            setEntryCache({ [cacheKey]: "resolved promise" });

            await createHostFederationPlugin().afterLoadEntry?.({
                origin: {} as never,
                remoteInfo: remoteInfo as never,
                remoteEntryExports: {} as never,
            });

            expect(getEntryCache()[cacheKey]).toBe("resolved promise");
        });
    });
});
