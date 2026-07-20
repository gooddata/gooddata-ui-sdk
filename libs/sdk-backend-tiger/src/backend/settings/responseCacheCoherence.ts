// (C) 2026 GoodData Corporation

import { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";

import { removeAxiosResponseCacheEntries } from "@gooddata/api-client-tiger";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

// The backend serves settings-resolution GETs with a cacheable Cache-Control (a short max-age),
// so the axios layer caches them and a read shortly after a settings write would return the
// pre-write body (read-after-write staleness). Every settings-resolution read therefore carries
// an explicit cache id embedding a per-instance GENERATION that every settings write bumps: a
// post-write read never shares a cache entry — nor deduplicates onto an in-flight request — with
// any pre-write read, so it always fetches fresh data. Superseded entries are additionally
// evicted (registry below) so they do not linger in memory until their TTL. Keyed per axios
// instance, like the response cache itself.
const trackedIds = new WeakMap<AxiosInstance, Set<string>>();
const generations = new WeakMap<AxiosInstance, number>();

const generationOf = (axiosInstance: AxiosInstance): number => generations.get(axiosInstance) ?? 0;

/**
 * Runs a settings-resolution request under a generation-scoped cache id and records the id for
 * eviction by the next settings write.
 *
 * The cacheScope must uniquely identify the call site including every request parameter that
 * changes the response (workspace, user-inclusion), otherwise two different reads would share a
 * cache entry and cross-serve each other's bodies.
 *
 * When a settings write completes while the request is in flight, the response lands under an
 * already-superseded generation id that no future read will look up; it is dropped right away
 * instead of tracked. The raced caller still receives the possibly-pre-write body once — that is
 * server-side request ordering no client cache can fix — but the cache never serves it again.
 *
 * @internal
 */
export async function trackSettingsResponse<TResponse extends AxiosResponse>(
    axiosInstance: AxiosInstance,
    cacheScope: string,
    request: (requestOptions: AxiosRequestConfig & { id: string }) => Promise<TResponse>,
): Promise<TResponse> {
    const dispatchedGeneration = generationOf(axiosInstance);
    const id = `gd.settings.resolve:${cacheScope}:g${dispatchedGeneration}`;
    const response = await request({ id });
    if (dispatchedGeneration !== generationOf(axiosInstance)) {
        await removeAxiosResponseCacheEntries(axiosInstance, [id]);
        return response;
    }
    let ids = trackedIds.get(axiosInstance);
    if (!ids) {
        ids = new Set();
        trackedIds.set(axiosInstance, ids);
    }
    ids.add(id);
    return response;
}

/**
 * Invalidates all settings-resolution reads after a settings write: bumps the generation, so
 * subsequent reads use fresh cache ids and cannot hit — or deduplicate onto — anything cached or
 * in flight from before the write, and evicts the superseded tracked entries so they do not
 * linger in memory until their TTL.
 *
 * Deliberately coarse: org-level settings cascade into every workspace's resolved settings, so any
 * settings write (org, workspace, or user) invalidates all of them instead of reasoning per scope.
 * Over-invalidation only costs one cheap refetch; under-invalidation would mean silent stale data.
 *
 * @internal
 */
export async function invalidateSettingsResponses(authCall: TigerAuthenticatedCallGuard): Promise<void> {
    await authCall(async (client) => {
        // Bump first and unconditionally — the registry is empty precisely when the first read
        // is still in flight, and that read must land under a superseded generation.
        generations.set(client.axios, generationOf(client.axios) + 1);
        const ids = trackedIds.get(client.axios);
        if (!ids?.size) {
            return;
        }
        const toEvict = [...ids];
        ids.clear();
        await removeAxiosResponseCacheEntries(client.axios, toEvict);
    });
}
