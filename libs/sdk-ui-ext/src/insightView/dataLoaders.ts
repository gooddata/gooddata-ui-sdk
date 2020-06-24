// (C) 2020 GoodData Corporation
import * as LRUCache from "lru-cache";
import { IAnalyticalBackend, IWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { IColorPalette, IInsight, ObjRef, objRefToString } from "@gooddata/sdk-model";

/**
 * Loaders for how many different workspaces will be kept.
 */
const LOADER_CACHE_SIZE = 5;

/**
 * How many insights will be kept for each workspace.
 */
const INSIGHT_CACHE_SIZE = 20;

/**
 * This class provides access to data needed to render an InsightView.
 *
 * @internal
 */
export interface IInsightViewDataLoader {
    /**
     * Obtains an insight specified by a ref.
     * @param backend - the {@link IAnalyticalBackend} instance to use to communicate with the backend
     * @param ref - the ref of the insight to obtain
     */
    getInsight(backend: IAnalyticalBackend, ref: ObjRef): Promise<IInsight>;
    /**
     * Obtains the color palette for the current workspace.
     * @param backend - the {@link IAnalyticalBackend} instance to use to communicate with the backend
     */
    getColorPalette(backend: IAnalyticalBackend): Promise<IColorPalette>;
    /**
     * Obtains the workspace settings for the current workspace.
     * @param backend - the {@link IAnalyticalBackend} instance to use to communicate with the backend
     */
    getWorkspaceSettings(backend: IAnalyticalBackend): Promise<IWorkspaceSettings>;
}

/**
 * This implementation of {@link IInsightViewDataLoader} provides caching capabilities for the data loading.
 *
 * @internal
 */
export class InsightViewDataLoader implements IInsightViewDataLoader {
    private cachedColorPalette: Promise<IColorPalette> | undefined;
    private cachedWorkspaceSettings: Promise<IWorkspaceSettings> | undefined;
    private insightCache: LRUCache<string, Promise<IInsight>> = new LRUCache({ max: INSIGHT_CACHE_SIZE });

    constructor(protected readonly workspace: string) {}

    public getInsight(backend: IAnalyticalBackend, ref: ObjRef): Promise<IInsight> {
        const cacheKey = objRefToString(ref);
        let insight = this.insightCache.get(cacheKey);

        if (!insight) {
            insight = backend
                .workspace(this.workspace)
                .insights()
                .getInsight(ref)
                .catch((error) => {
                    this.insightCache.del(cacheKey);
                    throw error;
                });

            this.insightCache.set(cacheKey, insight);
        }

        return insight;
    }

    public getColorPalette(backend: IAnalyticalBackend): Promise<IColorPalette> {
        if (!this.cachedColorPalette) {
            this.cachedColorPalette = backend
                .workspace(this.workspace)
                .styling()
                .colorPalette()
                .catch((error) => {
                    this.cachedColorPalette = undefined;
                    throw error;
                });
        }

        return this.cachedColorPalette;
    }

    public getWorkspaceSettings(backend: IAnalyticalBackend): Promise<IWorkspaceSettings> {
        if (!this.cachedWorkspaceSettings) {
            this.cachedWorkspaceSettings = backend
                .workspace(this.workspace)
                .settings()
                .query()
                .catch((error) => {
                    this.cachedWorkspaceSettings = undefined;
                    throw error;
                });
        }

        return this.cachedWorkspaceSettings;
    }
}

const loaders: LRUCache<string, IInsightViewDataLoader> = new LRUCache({ max: LOADER_CACHE_SIZE });

/**
 * Clears all the InsightView caches for all workspaces.
 *
 * @public
 */
export const clearInsightViewCaches = () => {
    loaders.reset();
};

/**
 * Gets an {@link IInsightViewDataLoader} instance for a given workspace.
 * @param workspace - the workspace to get the data from
 * @internal
 */
export const getInsightViewDataLoader = (workspace: string): IInsightViewDataLoader => {
    let loader = loaders.get(workspace);

    if (!loader) {
        loader = new InsightViewDataLoader(workspace);
        loaders.set(workspace, loader);
    }

    return loader;
};
