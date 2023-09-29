// (C) 2023 GoodData Corporation
import { LRUCache } from "lru-cache";
import identity from "lodash/identity.js";
import { invariant } from "ts-invariant";

import { IAccountSetting } from "@gooddata/api-model-bear";
import { SDK } from "../gooddata.js";

import { decoratedSdk } from "../decoratedModules/index.js";
import { cachedUser } from "./user.js";
import { cachedProject } from "./project.js";
import { IFeatureFlags } from "../interfaces.js";
import { cachingEnabled } from "./utils.js";

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
};

/**
 * Specifies cache settings and callbacks.
 *
 * @public
 */
export type CachingConfiguration = CachingCallbacks & CachingSettings;

/**
 * These are the recommended settings for the bear client caching.
 *
 * @remarks
 * For more information on what the options mean see {@link CachingConfiguration}.
 *
 * @public
 */
export const RecommendedCachingConfiguration: CachingConfiguration = {
    enableCurrentProfileCaching: true,
    maxProjectFeatureFlags: 1,
};

export type ProjectFeatureFlagsCacheEntry = {
    projectFeatureFlags: LRUCache<string, Promise<IFeatureFlags>>;
};

export type CachingContext = {
    caches: {
        currentProfile?: Promise<IAccountSetting> | null;
        projectFeatureFlags?: LRUCache<string, ProjectFeatureFlagsCacheEntry>;
    };
    config: CachingConfiguration;
};

function assertPositiveOrUndefined(value: number | undefined, valueName: string) {
    invariant(
        value === undefined || value > 0,
        `${valueName} to cache must be positive or undefined, got: ${value}`,
    );
}



function cacheControl(ctx: CachingContext): CacheControl {
    const control: CacheControl = {
        resetCurrentProfile: () => {
            ctx.caches.currentProfile = undefined;
        },

        resetProjectFeatureFlags: () => {
            ctx.caches.projectFeatureFlags?.clear();
        },

        resetAll: () => {
            control.resetCurrentProfile();
            control.resetProjectFeatureFlags();
        },
    };

    return control;
}

export function withCaching(sdk: SDK, config: CachingConfiguration): SDK {
    assertPositiveOrUndefined(config.maxProjectFeatureFlags, "maxProjectFeatureFlags");

    const projectFeatureFlags = cachingEnabled(config.maxProjectFeatureFlags);
    const currentProfileCaching = cachingEnabled(config.enableCurrentProfileCaching);

    const ctx: CachingContext = {
        caches: {
            projectFeatureFlags: projectFeatureFlags
                ? new LRUCache({ max: config.maxProjectFeatureFlags! })
                : undefined,
            currentProfile: undefined,
        },
        config,
    };

    const project = projectFeatureFlags ? cachedProject(ctx) : identity;
    const user = currentProfileCaching ? cachedUser(ctx) : identity;

    if (config.onCacheReady) {
        config.onCacheReady(cacheControl(ctx));
    }

    return decoratedSdk(sdk, {
        project,
        user,
    });
}
