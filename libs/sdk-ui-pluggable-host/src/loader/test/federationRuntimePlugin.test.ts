// (C) 2026 GoodData Corporation

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
    PRELOAD_LINK_TIMEOUT_MS,
    createHostFederationPlugin,
    evictRemoteEntryLoadCache,
} from "../federationRuntimePlugin.js";

const GLOBAL_LOADING_REMOTE_ENTRY = "__GLOBAL_LOADING_REMOTE_ENTRY__";

type EntryCache = Record<string, unknown>;

function setEntryCache(value: EntryCache | undefined): void {
    if (value === undefined) {
        delete (globalThis as Record<string, unknown>)[GLOBAL_LOADING_REMOTE_ENTRY];
        return;
    }
    (globalThis as Record<string, unknown>)[GLOBAL_LOADING_REMOTE_ENTRY] = value;
}

function getEntryCache(): EntryCache {
    return (globalThis as Record<string, unknown>)[GLOBAL_LOADING_REMOTE_ENTRY] as EntryCache;
}

const remoteInfo = {
    name: "gdc_metric_editor",
    entry: "/organization/remotes/gdc-metric-editor/remoteEntry.js",
};
const cacheKey = `${remoteInfo.name}:${remoteInfo.entry}`;

describe("federationRuntimePlugin", () => {
    let originalCache: unknown;

    beforeEach(() => {
        originalCache = (globalThis as Record<string, unknown>)[GLOBAL_LOADING_REMOTE_ENTRY];
    });

    afterEach(() => {
        setEntryCache(originalCache as EntryCache | undefined);
    });

    describe("evictRemoteEntryLoadCache", () => {
        it("drops the failed remote's entry promise so the next load retries", () => {
            setEntryCache({ [cacheKey]: Promise.reject(new Error("boom")).catch(() => undefined) });

            evictRemoteEntryLoadCache(remoteInfo);

            expect(cacheKey in getEntryCache()).toBe(false);
        });

        it("leaves other remotes' cached entries alone", () => {
            const otherKey = "gdc_catalog:/organization/remotes/gdc-catalog/remoteEntry.js";
            setEntryCache({ [cacheKey]: "failed", [otherKey]: "loaded" });

            evictRemoteEntryLoadCache(remoteInfo);

            expect(getEntryCache()).toEqual({ [otherKey]: "loaded" });
        });

        it("is a no-op when module federation has not created its cache yet", () => {
            setEntryCache(undefined);

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

        it("evicts the cached entry promise when a remote entry fails to load", async () => {
            setEntryCache({ [cacheKey]: "rejected promise" });

            await createHostFederationPlugin().afterLoadEntry?.({
                origin: {} as never,
                remoteInfo: remoteInfo as never,
                error: new Error("network down"),
            });

            expect(cacheKey in getEntryCache()).toBe(false);
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
