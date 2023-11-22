// (C) 2023 GoodData Corporation
import { LRUCache } from "lru-cache";
import identity from "lodash/identity.js";
import { invariant } from "ts-invariant";

import { SDK } from "../gooddata.js";

import { decoratedSdk } from "../decoratedModules/index.js";
import { cachedUser } from "./user.js";
import { cachedProject } from "./project.js";
import { cachingEnabled } from "./utils.js";
import { CacheControl, CachingConfiguration, CachingContext } from "./types.js";

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
    maxProjectPermissions: 1,
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
    assertPositiveOrUndefined(config.maxProjectPermissions, "maxProjectPermissions");

    const currentProfileCaching = cachingEnabled(config.enableCurrentProfileCaching);
    const projectFeatureFlags = cachingEnabled(config.maxProjectFeatureFlags);
    const projectPermissions = cachingEnabled(config.maxProjectPermissions);

    const ctx: CachingContext = {
        caches: {
            projectFeatureFlags: projectFeatureFlags
                ? new LRUCache({ max: config.maxProjectFeatureFlags! })
                : undefined,
            projectPermissions: projectPermissions
                ? new LRUCache({ max: config.maxProjectPermissions! })
                : undefined,
            currentProfile: undefined,
        },
        config,
    };

    const project = projectFeatureFlags || projectPermissions ? cachedProject(ctx) : identity;
    const user = currentProfileCaching ? cachedUser(ctx) : identity;

    if (config.onCacheReady) {
        config.onCacheReady(cacheControl(ctx));
    }

    return decoratedSdk(sdk, {
        project,
        user,
    });
}
