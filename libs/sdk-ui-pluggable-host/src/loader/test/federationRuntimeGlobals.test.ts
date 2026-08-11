// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { GLOBAL_LOADING_REMOTE_ENTRY, createHostFederationPlugin } from "../federationRuntimePlugin.js";

/**
 * Pins where Module Federation actually keeps its remote-entry load cache.
 *
 * The eviction in `federationRuntimePlugin` reaches into a global map by name, and the only thing
 * that makes it work is looking in the right place. A unit test that builds the map itself cannot
 * catch a wrong location — it would pass just as happily against a map nobody reads. So this file
 * deliberately uses no mock: importing the runtime executes the side effects in `runtime-core`'s
 * `global.js` that create these globals, and the assertions run against the real thing.
 *
 * The location is genuinely surprising. `__FEDERATION__` holds the instance, share, manifest and
 * preloaded registries, but the remote-entry cache is its sibling on the global root, so
 * "obviously it belongs under `__FEDERATION__`" is a plausible and silent way to break this.
 * If a future version does move it, these fail instead of the eviction quietly becoming a no-op.
 */
describe("module federation runtime globals", () => {
    it("keeps the remote-entry load cache on the global root, not under __FEDERATION__", async () => {
        await import("@module-federation/runtime");

        const globals = globalThis as unknown as Record<string, Record<string, unknown> | undefined>;

        expect(globals[GLOBAL_LOADING_REMOTE_ENTRY]).toBeTypeOf("object");
        expect(globals["__FEDERATION__"]).toBeTypeOf("object");
        expect(globals["__FEDERATION__"]?.[GLOBAL_LOADING_REMOTE_ENTRY]).toBeUndefined();
    });

    it("evicts a rejected entry from the map the runtime really uses", async () => {
        await import("@module-federation/runtime");

        const cache = (globalThis as unknown as Record<string, Record<string, unknown>>)[
            GLOBAL_LOADING_REMOTE_ENTRY
        ];
        const remoteInfo = {
            name: "gdc_metric_editor",
            entry: "/organization/remotes/gdc-metric-editor/remoteEntry.js",
        };
        const key = `${remoteInfo.name}:${remoteInfo.entry}`;
        cache[key] = "a promise that rejected";

        await createHostFederationPlugin().afterLoadEntry?.({
            origin: {} as never,
            remoteInfo: remoteInfo as never,
            error: new Error("network down"),
        });

        expect(key in cache).toBe(false);
    });
});
