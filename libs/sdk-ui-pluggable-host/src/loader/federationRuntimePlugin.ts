// (C) 2026 GoodData Corporation

import { type ModuleFederationRuntimePlugin } from "@module-federation/runtime";

/**
 * Timeout applied to every `<link rel="preload">` Module Federation creates.
 *
 * MF's DOM helper hardcodes 20s (`createLink` in `@module-federation/sdk`). On a throttled
 * connection a legitimate asset routinely needs longer, and hitting the timeout is doubly
 * harmful: the resource is reported as a failure (surfacing as
 * `preloadRemote failed to load N resource(s)`) *and* the `<link>` is removed from the
 * document, which cancels the in-flight download. 60s is long enough for a slow but
 * progressing fetch to land and warm the cache, and short enough that the promise does not
 * stay pending indefinitely for a user who has long since navigated away.
 */
export const PRELOAD_LINK_TIMEOUT_MS = 60_000;

/**
 * Key of the global map in which Module Federation caches remote-entry load promises,
 * and the separator it composes the map keys with (`SEPARATOR` in `@module-federation/sdk`).
 *
 * The map sits on the global root, **not** under `globalThis.__FEDERATION__` where the
 * instance/share/manifest registries live: `runtime-core`'s `global.js` does
 * `definePropertyGlobalVal(CurrentGlobal, "__GLOBAL_LOADING_REMOTE_ENTRY__", {})` before it
 * builds `__FEDERATION__`, and `CurrentGlobal` is `globalThis`. That asymmetry is easy to
 * "correct" into a silent no-op, so `federationRuntimeGlobals.test.ts` pins it against the
 * real runtime.
 *
 * Exported for that test.
 */
export const GLOBAL_LOADING_REMOTE_ENTRY = "__GLOBAL_LOADING_REMOTE_ENTRY__";
const REMOTE_ENTRY_KEY_SEPARATOR = ":";

type RemoteEntryLoadingCache = Record<string, unknown>;

/**
 * Drops a remote entry's cached load promise so the next attempt starts from scratch.
 *
 * MF stores the promise returned by `getRemoteEntry` in a process-global map and — as of
 * `@module-federation/runtime` 2.6.0 — only ever deletes it from `removeRemote`, never when
 * the promise rejects. A single failed entry load, including one kicked off by a background
 * hover preload the user never asked for, would therefore be replayed to every later caller
 * and make that application unopenable for the lifetime of the page.
 *
 * Exported for tests.
 */
export function evictRemoteEntryLoadCache(remoteInfo: { name: string; entry: string }): void {
    const cache = (globalThis as Record<string, unknown>)[GLOBAL_LOADING_REMOTE_ENTRY] as
        | RemoteEntryLoadingCache
        | undefined;

    if (!cache) {
        return;
    }

    delete cache[`${remoteInfo.name}${REMOTE_ENTRY_KEY_SEPARATOR}${remoteInfo.entry}`];
}

/**
 * Host-side Module Federation runtime plugin. Registered on the federation instance created
 * by the remote loader; both hooks work around behaviour of the MF runtime we cannot
 * configure any other way.
 */
export function createHostFederationPlugin(): ModuleFederationRuntimePlugin {
    return {
        name: "gdc-host-remote-loader",

        // Raise the hardcoded 20s preload-link timeout. Returning an object without `link`
        // leaves MF's own element (and its attributes) in place — only the timeout changes.
        createLink: () => ({ timeout: PRELOAD_LINK_TIMEOUT_MS }),

        // Fires on both the success and the failure path of a remote-entry load; only the
        // failure path needs the cache evicting.
        afterLoadEntry: async ({ remoteInfo, error }) => {
            if (error) {
                evictRemoteEntryLoadCache(remoteInfo);
            }
        },
    };
}
