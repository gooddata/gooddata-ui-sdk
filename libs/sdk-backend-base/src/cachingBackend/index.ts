// (C) 2007-2020 GoodData Corporation
import {
    IAnalyticalBackend,
    IDataView,
    IExecutionFactory,
    IExecutionResult,
    IPreparedExecution,
    IWorkspaceCatalog,
    IWorkspaceCatalogFactory,
    IWorkspaceCatalogFactoryOptions,
} from "@gooddata/sdk-backend-spi";
import { CatalogDecoratorFactory, decoratedBackend, ExecutionDecoratorFactory } from "../decoratedBackend";
import LRUCache from "lru-cache";
import {
    DecoratedExecutionFactory,
    DecoratedExecutionResult,
    DecoratedPreparedExecution,
    PreparedExecutionWrapper,
    DecoratedDataView,
} from "../decoratedBackend/execution";
import { DecoratedWorkspaceCatalogFactory } from "../decoratedBackend/catalog";
import stringify from "json-stable-stringify";
import identity = require("lodash/identity");
import isEqual = require("lodash/isEqual");
import invariant from "ts-invariant";
import { IExecutionDefinition } from "@gooddata/sdk-model";

//
// Supporting types
//

type ExecutionCacheEntry = {
    result: Promise<IExecutionResult>;
};

type CatalogCacheEntry = {
    catalogForOptions: LRUCache<string, Promise<IWorkspaceCatalog>>;
};

type CachingContext = {
    caches: {
        execution?: LRUCache<string, ExecutionCacheEntry>;
        workspaceCatalogs?: LRUCache<string, CatalogCacheEntry>;
    };
    config: CachingConfiguration;
};

//
// Execution caching
//

class WithExecutionCaching extends DecoratedPreparedExecution {
    constructor(decorated: IPreparedExecution, private readonly ctx: CachingContext) {
        super(decorated);
    }

    public execute = async (): Promise<IExecutionResult> => {
        const cacheKey = this.fingerprint();
        const cache = this.ctx.caches.execution!;
        let cacheEntry = cache.get(cacheKey);

        if (!cacheEntry) {
            const result = super
                .execute()
                .then((res) => {
                    return new WithExecutionResultCaching(res, this.createNew, this.ctx);
                })
                .catch((e) => {
                    cache.del(cacheKey);
                    throw e;
                });

            cacheEntry = { result };
            cache.set(cacheKey, cacheEntry);
        }

        return new DefinitionSanitizingExecutionResult(
            await cacheEntry.result,
            this.createNew,
            this.definition,
        );
    };

    protected createNew = (decorated: IPreparedExecution): IPreparedExecution => {
        return new WithExecutionCaching(decorated, this.ctx);
    };
}

/**
 * This DataView decorator makes sure that definition used in it is the same as the definition in the result.
 *
 * See the usage of this class in {@link DefinitionSanitizingExecutionResult} for more.
 */
class DefinitionSanitizingDataView extends DecoratedDataView {
    constructor(decorated: IDataView, result: IExecutionResult) {
        super(decorated, result);
        this.definition = result.definition;
    }
}

/**
 * This ExecutionResult decorator makes sure that definitions used throughout the result are set
 * to the definitionOverride provided. This is useful with caching because different definitions may yield
 * the same cache key, but having the proper definition in the returned execution result is critical:
 * the definitions in the result must match the one which was used to request it.
 * This however is not always the case when using cached results, so we need to ensure it explicitly.
 *
 * See the usage of this class in {@link WithExecutionCaching} for more.
 */
class DefinitionSanitizingExecutionResult extends DecoratedExecutionResult {
    constructor(
        decorated: IExecutionResult,
        wrapper: PreparedExecutionWrapper,
        definitionOverride: IExecutionDefinition,
    ) {
        super(decorated, wrapper);
        this.definition = definitionOverride;
    }

    public readAll = async (): Promise<IDataView> => {
        return this.withSanitizedDefinition(await super.readAll());
    };

    public readWindow = async (offset: number[], size: number[]): Promise<IDataView> => {
        return this.withSanitizedDefinition(await super.readWindow(offset, size));
    };

    private withSanitizedDefinition = (original: IDataView): IDataView => {
        // if definitions are already correct, return the original object to preserve referential equality where possible
        if (
            isEqual(original.definition, this.definition) &&
            isEqual(original.result.definition, this.definition)
        ) {
            return original;
        }

        return new DefinitionSanitizingDataView(original, this);
    };
}

function windowKey(offset: number[], size: number[]): string {
    return `o(${offset.join(",")})_s(${size.join(",")})`;
}

class WithExecutionResultCaching extends DecoratedExecutionResult {
    private allData: Promise<IDataView> | undefined;
    private windows: LRUCache<string, Promise<IDataView>> | undefined;

    constructor(
        decorated: IExecutionResult,
        wrapper: PreparedExecutionWrapper,
        private readonly ctx: CachingContext,
    ) {
        super(decorated, wrapper);

        if (cachingEnabled(this.ctx.config.maxResultWindows)) {
            this.windows = new LRUCache({ max: this.ctx.config.maxResultWindows });
        }
    }

    public readAll = (): Promise<IDataView> => {
        if (!this.allData) {
            this.allData = super.readAll().catch((e) => {
                this.allData = undefined;
                throw e;
            });
        }

        return this.allData;
    };

    public readWindow = (offset: number[], size: number[]): Promise<IDataView> => {
        if (!this.windows) {
            return super.readWindow(offset, size);
        }

        const cacheKey = windowKey(offset, size);
        let window: Promise<IDataView> | undefined = this.windows.get(cacheKey);

        if (!window) {
            window = super.readWindow(offset, size).catch((e) => {
                if (this.windows) {
                    this.windows.del(cacheKey);
                }

                throw e;
            });
            this.windows.set(cacheKey, window);
        }

        return window;
    };
}

//
// Catalog caching
//

function optionsKey(options: IWorkspaceCatalogFactoryOptions): string {
    return stringify(options);
}

class WithCatalogCaching extends DecoratedWorkspaceCatalogFactory {
    constructor(decorated: IWorkspaceCatalogFactory, private readonly ctx: CachingContext) {
        super(decorated);
    }

    public load = (): Promise<IWorkspaceCatalog> => {
        const cache = this.getOrCreateWorkspaceEntry(this.workspace).catalogForOptions;
        const cacheKey = optionsKey(this.options);
        let catalog = cache.get(cacheKey);

        if (!catalog) {
            catalog = super.load().catch((e) => {
                cache.del(cacheKey);
                throw e;
            });

            cache.set(cacheKey, catalog);
        }

        return catalog;
    };

    protected createNew = (decorated: IWorkspaceCatalogFactory): IWorkspaceCatalogFactory => {
        return new WithCatalogCaching(decorated, this.ctx);
    };

    private getOrCreateWorkspaceEntry = (workspace: string): CatalogCacheEntry => {
        const cache = this.ctx.caches.workspaceCatalogs!;
        let cacheEntry = cache.get(workspace);

        if (!cacheEntry) {
            cacheEntry = {
                catalogForOptions: new LRUCache<string, Promise<IWorkspaceCatalog>>({
                    max: this.ctx.config.maxCatalogOptions,
                }),
            };
            cache.set(workspace, cacheEntry);
        }

        return cacheEntry;
    };
}

//
//
//

function cachedExecutions(ctx: CachingContext): ExecutionDecoratorFactory {
    return (original: IExecutionFactory) =>
        new DecoratedExecutionFactory(original, (execution) => new WithExecutionCaching(execution, ctx));
}

function cachedCatalog(ctx: CachingContext): CatalogDecoratorFactory {
    return (original: IWorkspaceCatalogFactory) => new WithCatalogCaching(original, ctx);
}

function cachingEnabled(desiredSize: number | undefined): boolean {
    return desiredSize === undefined || desiredSize > 0;
}

//
// Public interface
//

/**
 * Specifies where should the caching decorator apply and to what size should caches grow.
 *
 * @beta
 */
export type CachingConfiguration = {
    /**
     * Maximum number of executions which will have their results cached. The execution fingerprint is used
     * as cache key - the caching is thus subject to some limitations. See `defFingerprint` function for more
     * information.
     *
     * When limit is reached, cache entries will be evicted using LRU policy.
     *
     * When no maximum number is specified, the cache will be unbounded and no evictions will happen. Unbounded
     * executions cache is dangerous in applications with long-lived sessions that can create many unique executions -
     * memory usage will only go up.
     *
     * When non-positive number is specified, then no caching will be done.
     */
    maxExecutions: number | undefined;

    /**
     * Maximum number of execution result's pages to cache PER result. The window offset and limit are used as cache key.
     *
     * When limit is reached, cache entries will be evicted using LRU policy.
     *
     * When no maximum number is specified, the cache will be unbounded and no evictions will happen. Unbounded
     * result window cache is dangerous in applications that read result windows in 'random' fashion.
     *
     * When non-positive number is specified, then no caching of result windows will be done.
     *
     * Note: this option has no effect if execution caching is disabled.
     */
    maxResultWindows: number | undefined;

    /**
     * Maximum number of workspaces for which to cache catalogs. The workspace identifier is used as cache key. For
     * each workspace, there will be a cache entry holding `maxCatalogOptions` entries.
     *
     * When limit is reached, cache entries will be evicted using LRU policy.
     *
     * When no maximum number is specified, the cache will be unbounded and no evictions will happen. Unbounded
     * catalogs cache may be OK in applications where number of workspaces is small - the cache will be limited
     * naturally and will not grow uncontrollably.
     *
     * When non-positive number is specified, then no caching of result windows will be done.
     */
    maxCatalogs: number | undefined;

    /**
     * Catalog can be viewed in many different ways - determined by the options specified during load. This option
     * indicates how many unique options to cache results for.
     *
     * When limit is reached, cache entries will be evicted using LRU policy.
     *
     * When no maximum number is specified, the cache will be unbounded and no evictions will happen. How dangerous
     * this is depends on how many catalog load options combinations your application allows to create. Recommended
     * approach is to load entire catalog of all items once and reuse it. If there is chance that your app can create
     * many unique options, then it is better to bound this.
     *
     * Setting non-negative number here is invalid. If you want to turn off catalog caching, tweak the `maxCatalogs`.
     */
    maxCatalogOptions: number | undefined;
};

/**
 * @beta
 */
export const DefaultCachingConfiguration: CachingConfiguration = {
    maxExecutions: 10,
    maxResultWindows: 5,
    maxCatalogs: 1,
    maxCatalogOptions: 50,
};

/**
 * Adds caching layer on top of an existing analytical backend instance. It is currently possible to cache
 * results of executions and the workspace LDM catalog.
 *
 * @remarks see {@link CachingConfiguration} properties for more information.
 * @param realBackend - real backend to decorate with caching
 * @param config - caching configuration
 * @beta
 */
export function withCaching(
    realBackend: IAnalyticalBackend,
    config: CachingConfiguration = DefaultCachingConfiguration,
): IAnalyticalBackend {
    invariant(
        config.maxCatalogOptions === undefined || config.maxCatalogOptions > 0,
        `maxCatalogOptions to cache must be positive or undefined, got: ${config.maxCatalogOptions}`,
    );

    const execCaching = cachingEnabled(config.maxExecutions);
    const catalogCaching = cachingEnabled(config.maxCatalogs);

    const ctx: CachingContext = {
        caches: {
            execution: execCaching ? new LRUCache({ max: config.maxExecutions }) : undefined,
            workspaceCatalogs: catalogCaching ? new LRUCache({ max: config.maxCatalogs }) : undefined,
        },
        config,
    };

    const execution = execCaching ? cachedExecutions(ctx) : identity;
    const catalog = catalogCaching ? cachedCatalog(ctx) : identity;

    return decoratedBackend(realBackend, { execution, catalog });
}
