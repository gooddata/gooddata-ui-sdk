// (C) 2023 GoodData Corporation
import { LRUCache } from "lru-cache";

import { IAccountSetting, IAssociatedProjectPermissions } from "@gooddata/api-model-bear";

import { IFeatureFlags } from "../interfaces.js";

/**
 * Cache control can be used to interact with the caching layer - at the moment to reset the contents of the
 * different top-level caches.
 *
 * @public
 */
export type CacheControl = {
    /**
     * Resets current profile caches.
     */
    resetCurrentProfile: () => void;
    /**
     * Resets all project feature flags caches.
     */
    resetProjectFeatureFlags: () => void;

    /**
     * Convenience method to reset all caches (calls all the particular resets).
     */
    resetAll: () => void;
};

/**
 * Specifies callbacks for cache events.
 *
 * @public
 */
export type CachingCallbacks = {
    /**
     * Specify function to call once the caching is set up. If present, the function will be called
     * with an instance of {@link CacheControl} which you can use to interact with the caches.
     *
     * @param cacheControl - cache control instance
     */
    onCacheReady?: (cacheControl: CacheControl) => void;
};

/**
 * Specifies where should the caching decorator apply and to what size should caches grow.
 *
 * @public
 */
export type CachingSettings = {
    /**
     * Whether current profile should be cached
     */
    enableCurrentProfileCaching?: boolean;

    /**
     * Maximum number of feature flags to cache per project/workspace.
     *
     * When limit is reached, cache entries will be evicted using LRU policy.
     *
     * When no maximum number is specified, the cache will be unbounded and no evictions will happen. Unbounded
     * feature flags cache is dangerous in applications that change query the settings of many different
     * workspaces - this will cache quite large objects for each workspace and can make the memory usage go up.
     *
     * When non-positive number is specified, then no caching of result windows will be done.
     */
    maxProjectFeatureFlags?: number;

    /**
     * Maximum number of permissions to cache per project/workspace + user combinations.
     *
     * When limit is reached, cache entries will be evicted using LRU policy.
     *
     * When no maximum number is specified, the cache will be unbounded and no evictions will happen. Unbounded
     * permissions cache is dangerous in applications that query the permissions of many different
     * workspaces or users - this will cache quite large objects for each workspace/user and can make the memory usage go up.
     *
     * When non-positive number is specified, then no caching of result windows will be done.
     */
    maxProjectPermissions?: number;
};

/**
 * Specifies cache settings and callbacks.
 *
 * @public
 */
export type CachingConfiguration = CachingCallbacks & CachingSettings;

export type ProjectFeatureFlagsCacheEntry = {
    projectFeatureFlags: LRUCache<string, Promise<IFeatureFlags>>;
};
export type ProjectPermissionsCacheEntry = {
    projectPermissions: LRUCache<string, Promise<IAssociatedProjectPermissions>>;
};

export type CachingContext = {
    caches: {
        currentProfile?: Promise<IAccountSetting> | null;
        projectFeatureFlags?: LRUCache<string, ProjectFeatureFlagsCacheEntry>;
        projectPermissions?: LRUCache<string, ProjectPermissionsCacheEntry>;
    };
    config: CachingConfiguration;
};
