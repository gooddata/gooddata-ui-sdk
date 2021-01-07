// (C) 2021 GoodData Corporation
import LRUCache from "lru-cache";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IInsight, ObjRef, objRefToString } from "@gooddata/sdk-model";
import { INSIGHT_CACHE_SIZE } from "./constants";
import { dataLoaderAbstractFactory } from "./DataLoaderAbstractFactory";

/**
 * @internal
 */
export interface IInsightDataLoader {
    /**
     * Obtains an insight specified by a ref.
     * @param backend - the {@link IAnalyticalBackend} instance to use to communicate with the backend
     * @param ref - the ref of the insight to obtain
     */
    getInsight(backend: IAnalyticalBackend, ref: ObjRef): Promise<IInsight>;
}

class InsightDataLoader implements IInsightDataLoader {
    private insightCache: LRUCache<string, Promise<IInsight>> = new LRUCache({
        max: INSIGHT_CACHE_SIZE,
    });

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
}

/**
 * @internal
 */
export const insightDataLoaderFactory = dataLoaderAbstractFactory<IInsightDataLoader>(
    (workspace) => new InsightDataLoader(workspace),
);
