// (C) 2022 GoodData Corporation
import { IAssociatedProjectPermissions, IFeatureFlags } from "@gooddata/api-model-bear";
import { LRUCache } from "lru-cache";

import { CachingContext, ProjectConfigCacheEntry } from "./cachingClient.js";
import { IProjectConfigSettingItem, ProjectModule } from "../project.js";
import { ProjectModuleDecorator } from "../decoratedModules/project.js";

export class ProjectModuleWithCaching extends ProjectModuleDecorator {
    private originalGetConfig: (projectId: string) => Promise<IProjectConfigSettingItem[]>;
    constructor(decorated: ProjectModule, private readonly ctx: CachingContext) {
        super(decorated);
        // rebind cached implementation to the original sdk to use it also in other methods
        this.originalGetConfig = decorated.getConfig.bind(decorated);
        decorated.getConfig = (projectId: string) => this.getConfig(projectId);
    }

    public getCurrentProjectId(): Promise<string> {
        return super.getCurrentProjectId();
    }

    public getConfig(projectId: string): Promise<IProjectConfigSettingItem[]> {
        const cache = this.getOrCreateConfigEntry(projectId).projectConfig;
        let config = cache.get(projectId);

        if (!config) {
            config = this.originalGetConfig(projectId);

            cache.set(projectId, config);
        }

        return config;
    }

    public getConfigItem(projectId: string, key: string): Promise<IProjectConfigSettingItem | undefined> {
        return super.getConfigItem(projectId, key);
    }

    public getProjectFeatureFlags(projectId: string, source?: string): Promise<IFeatureFlags> {
        return super.getProjectFeatureFlags(projectId, source);
    }

    public getPermissions(workspaceId: string, userId: string): Promise<IAssociatedProjectPermissions> {
        return super.getPermissions(workspaceId, userId);
    }

    private getOrCreateConfigEntry = (projectId: string): ProjectConfigCacheEntry => {
        const cache = this.ctx.caches.projectConfigs!;
        let cacheEntry = cache.get(projectId);

        if (!cacheEntry) {
            cacheEntry = {
                projectConfig: new LRUCache<string, Promise<IProjectConfigSettingItem[]>>({
                    max: this.ctx.config.maxProjectConfig!,
                }),
            };
            cache.set(projectId, cacheEntry);
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
