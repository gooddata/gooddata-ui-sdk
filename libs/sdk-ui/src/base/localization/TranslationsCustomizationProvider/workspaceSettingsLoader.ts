// (C) 2021 GoodData Corporation
import { IAnalyticalBackend, IWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { LRUCache } from "@gooddata/util";

const LOADER_CACHE_SIZE = 20;

class WorkspaceSettingsLoader {
    private settingsCache = new LRUCache<Promise<IWorkspaceSettings>>({ maxSize: LOADER_CACHE_SIZE });

    public load(backend: IAnalyticalBackend, workspace: string): Promise<IWorkspaceSettings> {
        const cacheKey = workspace;
        let settings = this.settingsCache.get(cacheKey);

        if (!settings) {
            settings = backend
                .workspace(workspace)
                .settings()
                .getSettings()
                .catch((error) => {
                    // do not cache errors
                    this.settingsCache.delete(cacheKey);
                    throw error;
                });
            this.settingsCache.set(cacheKey, settings);
        }

        return settings;
    }
}

let workspaceSettingsLoaderInstance: WorkspaceSettingsLoader | undefined;

/**
 * Gets a loader object for loading workspace settings data efficiently.
 */
export function getWorkspaceSettingsLoader(): WorkspaceSettingsLoader {
    if (!workspaceSettingsLoaderInstance) {
        workspaceSettingsLoaderInstance = new WorkspaceSettingsLoader();
    }
    return workspaceSettingsLoaderInstance;
}

/**
 * Resets the cached loader object for loading workspace settings data efficiently.
 */
export function resetWorkspaceSettingsLoader(): void {
    workspaceSettingsLoaderInstance = undefined;
}
