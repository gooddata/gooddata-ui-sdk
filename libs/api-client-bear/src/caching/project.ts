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
            const cache = this.getOrCreateFeatureFlagsEntry(projectId).projectFeatureFlags;
            const key = `${source}`;
            featureFlags = cache.get(key);

            if (!featureFlags) {
                featureFlags = super.getProjectFeatureFlags(projectId, source);

                cache.set(key, featureFlags);
            }
        } else {
            featureFlags = super.getProjectFeatureFlags(projectId, source);
        }

        return featureFlags;
    }

    public getPermissions(workspaceId: string, userId: string): Promise<IAssociatedProjectPermissions> {
        let permissions;
        if (cachingEnabled(this.ctx.config.maxProjectPermissions)) {
            const key = `${workspaceId}_${userId}`;
            const cache = this.getOrCreatePermissionsEntry(key).projectPermissions;
            permissions = cache.get(key);

            if (!permissions) {
                permissions = super.getPermissions(workspaceId, userId);

                cache.set(key, permissions);
            }
        } else {
            permissions = super.getPermissions(workspaceId, userId);
        }

        return permissions;
    }

    private getOrCreateFeatureFlagsEntry = (projectId: string): ProjectFeatureFlagsCacheEntry => {
        const cache = this.ctx.caches.projectFeatureFlags!;
        const key = projectId;
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

    private getOrCreatePermissionsEntry = (key: string): ProjectPermissionsCacheEntry => {
        const cache = this.ctx.caches.projectPermissions!;
        let cacheEntry = cache.get(key);

        if (!cacheEntry) {
            cacheEntry = {
                projectPermissions: new LRUCache<string, Promise<IAssociatedProjectPermissions>>({
                    max: this.ctx.config.maxProjectPermissions!,
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
