// (C) 2022 GoodData Corporation
import { IAssociatedProjectPermissions, IFeatureFlags } from "@gooddata/api-model-bear";
import { LRUCache } from "lru-cache";

import {
    CachingContext,
    ProjectFeatureFlagsCacheEntry,
    ProjectPermissionsCacheEntry,
} from "./cachingClient.js";
import { IProjectConfigSettingItem, ProjectModule } from "../project.js";
import { ProjectModuleDecorator } from "../decoratedModules/project.js";
import { cachingEnabled } from "./utils.js";

export class ProjectModuleWithCaching extends ProjectModuleDecorator {
    constructor(decorated: ProjectModule, private readonly ctx: CachingContext) {
        super(decorated);
    }

    public getCurrentProjectId(): Promise<string> {
        return super.getCurrentProjectId();
    }

    public getConfig(projectId: string): Promise<IProjectConfigSettingItem[]> {
        return super.getConfig(projectId);
    }

    public getConfigItem(projectId: string, key: string): Promise<IProjectConfigSettingItem | undefined> {
        return super.getConfigItem(projectId, key);
    }

    public getProjectFeatureFlags(projectId: string, source?: string): Promise<IFeatureFlags> {
        let featureFlags;
        if (cachingEnabled(this.ctx.config.maxProjectFeatureFlags)) {
            const cache = this.getOrCreateFeatureFlagsEntry(projectId, source).projectFeatureFlags;
            featureFlags = cache.get(projectId);

            if (!featureFlags) {
                featureFlags = super.getProjectFeatureFlags(projectId, source);

                cache.set(projectId, featureFlags);
            }
        } else {
            featureFlags = super.getProjectFeatureFlags(projectId, source);
        }

        return featureFlags;
    }

    public getPermissions(workspaceId: string, userId: string): Promise<IAssociatedProjectPermissions> {
        return super.getPermissions(workspaceId, userId);
    }

    private getOrCreateFeatureFlagsEntry = (
        projectId: string,
        source?: string,
    ): ProjectFeatureFlagsCacheEntry => {
        const cache = this.ctx.caches.projectFeatureFlags!;
        const key = `${projectId}_${source}`;
        let cacheEntry = cache.get(key);

        if (!cacheEntry) {
            cacheEntry = {
                projectFeatureFlags: new LRUCache<string, Promise<IFeatureFlags>>({
                    max: this.ctx.config.maxProjectFeatureFlags!,
                }),
            };
            cache.set(key, cacheEntry);
        }

        return cacheEntry;
    };
}

/**
 * @alpha
 */
export type ProjectModuleDecoratorFactory = (user: ProjectModule) => ProjectModule;

export function cachedProject(ctx: CachingContext): ProjectModuleDecoratorFactory {
    return (original: ProjectModule) =>
        new ProjectModuleWithCaching(original, ctx) as unknown as ProjectModule;
}
