// (C) 2007-2023 GoodData Corporation
import {
    IAnalyticalBackend,
    IBackendCapabilities,
    IDataView,
    IElementsQuery,
    IElementsQueryAttributeFilter,
    IElementsQueryFactory,
    IElementsQueryOptions,
    IElementsQueryResult,
    IExecutionFactory,
    IExecutionResult,
    IPreparedExecution,
    ISecuritySettingsService,
    IUserWorkspaceSettings,
    IWorkspaceAttributesService,
    IWorkspaceCatalog,
    IWorkspaceCatalogFactory,
    IWorkspaceCatalogFactoryOptions,
    IWorkspaceSettings,
    IWorkspaceSettingsService,
    ValidationContext,
} from "@gooddata/sdk-backend-spi";
import {
    AttributesDecoratorFactory,
    CatalogDecoratorFactory,
    decoratedBackend,
    ExecutionDecoratorFactory,
    SecuritySettingsDecoratorFactory,
    WorkspaceSettingsDecoratorFactory,
} from "../decoratedBackend/index.js";
import { LRUCache } from "lru-cache";
import { DecoratedSecuritySettingsService } from "../decoratedBackend/securitySettings.js";
import {
    DecoratedDataView,
    DecoratedExecutionFactory,
    DecoratedExecutionResult,
    DecoratedPreparedExecution,
    PreparedExecutionWrapper,
} from "../decoratedBackend/execution.js";
import { DecoratedWorkspaceCatalogFactory } from "../decoratedBackend/catalog.js";
import { DecoratedElementsQuery, DecoratedElementsQueryFactory } from "../decoratedBackend/elements.js";
import stringify from "json-stable-stringify";
import compact from "lodash/compact.js";
import first from "lodash/first.js";
import flow from "lodash/flow.js";
import identity from "lodash/identity.js";
import { invariant } from "ts-invariant";
import partition from "lodash/partition.js";
import SparkMD5 from "spark-md5";
import {
    areObjRefsEqual,
    idRef,
    IExecutionDefinition,
    isIdentifierRef,
    isUriRef,
    ObjectType,
    ObjRef,
    uriRef,
    IAttributeDisplayFormMetadataObject,
    IMetadataObject,
    IAttributeMetadataObject,
    IRelativeDateFilter,
    IMeasure,
    objRefToString,
    IMeasureDefinitionType,
} from "@gooddata/sdk-model";
import { DecoratedWorkspaceAttributesService } from "../decoratedBackend/attributes.js";
import { DecoratedWorkspaceSettingsService } from "../decoratedBackend/workspaceSettings.js";

//
// Supporting types
//

type ExecutionCacheEntry = {
    result: Promise<IExecutionResult>;
};

type CatalogCacheEntry = {
    catalogForOptions: LRUCache<string, Promise<IWorkspaceCatalog>>;
};

type SecuritySettingsCacheEntry = {
    valid: LRUCache<string, Promise<boolean>>;
};

type AttributeCacheEntry = {
    displayForms: LRUCache<string, Promise<IAttributeDisplayFormMetadataObject>>;
    attributesByDisplayForms: LRUCache<string, Promise<IAttributeMetadataObject>>;
    attributeElementResults?: LRUCache<string, Promise<IElementsQueryResult>>;
};

type WorkspaceSettingsCacheEntry = {
    userWorkspaceSettings: LRUCache<string, Promise<IUserWorkspaceSettings>>;
    workspaceSettings: LRUCache<string, Promise<IWorkspaceSettings>>;
};

type CachingContext = {
    caches: {
        execution?: LRUCache<string, ExecutionCacheEntry>;
        workspaceCatalogs?: LRUCache<string, CatalogCacheEntry>;
        securitySettings?: LRUCache<string, SecuritySettingsCacheEntry>;
        workspaceAttributes?: LRUCache<string, AttributeCacheEntry>;
        workspaceSettings?: LRUCache<string, WorkspaceSettingsCacheEntry>;
    };
    config: CachingConfiguration;
    capabilities: IBackendCapabilities;
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
                    cache.delete(cacheKey);
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
            this.windows = new LRUCache({ max: this.ctx.config.maxResultWindows! });
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
                    this.windows.delete(cacheKey);
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
                cache.delete(cacheKey);
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
                    max: this.ctx.config.maxCatalogOptions!,
                }),
            };
            cache.set(workspace, cacheEntry);
        }

        return cacheEntry;
    };
}

//
// Organization security settings caching
//

function validUrlInContextKey(url: string, context: ValidationContext): string {
    return `${context}_${stringify(url)}`;
}

class WithSecuritySettingsCaching extends DecoratedSecuritySettingsService {
    constructor(decorated: ISecuritySettingsService, private readonly ctx: CachingContext) {
        super(decorated);
    }

    public isUrlValid = (url: string, context: ValidationContext): Promise<boolean> => {
        const cache = this.getOrCreateSecuritySettingsEntry(this.scope).valid;
        const cacheKey = validUrlInContextKey(url, context);
        let result = cache.get(cacheKey);

        if (!result) {
            result = super.isUrlValid(url, context).catch((e) => {
                cache.delete(cacheKey);
                throw e;
            });

            cache.set(cacheKey, result);
        }

        return result;
    };

    public isDashboardPluginUrlValid = (url: string, workspace: string): Promise<boolean> => {
        const scope = `plugins_${workspace}`;
        const cache = this.getOrCreateSecuritySettingsEntry(scope).valid;
        let result = cache.get(url);

        if (!result) {
            result = super.isDashboardPluginUrlValid(url, workspace).catch((e) => {
                cache.delete(url);
                throw e;
            });

            cache.set(url, result);
        }

        return result;
    };

    private getOrCreateSecuritySettingsEntry = (scope: string): SecuritySettingsCacheEntry => {
        const cache = this.ctx.caches.securitySettings!;
        let cacheEntry = cache.get(scope);

        if (!cacheEntry) {
            cacheEntry = {
                valid: new LRUCache<string, Promise<boolean>>({
                    max: this.ctx.config.maxSecuritySettingsOrgUrls!,
                    ttl: this.ctx.config.maxSecuritySettingsOrgUrlsAge,
                }),
            };
            cache.set(scope, cacheEntry);
        }

        return cacheEntry;
    };
}

class WithWorkspaceSettingsCaching extends DecoratedWorkspaceSettingsService {
    constructor(
        decorated: IWorkspaceSettingsService,
        private readonly ctx: CachingContext,
        private readonly workspace: string,
    ) {
        super(decorated);
    }

    public getSettings = (): Promise<IWorkspaceSettings> => {
        const cache = this.getOrCreateWorkspaceEntry(this.workspace).workspaceSettings;
        const cacheKey = this.workspace;

        let workspaceSettings = cache.get(cacheKey);

        if (!workspaceSettings) {
            workspaceSettings = super.getSettings().catch((e) => {
                cache.delete(cacheKey);
                throw e;
            });

            cache.set(cacheKey, workspaceSettings);
        }

        return workspaceSettings;
    };

    public getSettingsForCurrentUser(): Promise<IUserWorkspaceSettings> {
        const cache = this.getOrCreateWorkspaceEntry(this.workspace).userWorkspaceSettings;
        const cacheKey = this.workspace; // we assume that the current user does not change over the life span of the backend instance

        let userWorkspaceSettings = cache.get(cacheKey);

        if (!userWorkspaceSettings) {
            userWorkspaceSettings = super.getSettingsForCurrentUser().catch((e) => {
                cache.delete(cacheKey);
                throw e;
            });

            cache.set(cacheKey, userWorkspaceSettings);
        }

        return userWorkspaceSettings;
    }

    public async setLocale(locale: string): Promise<void> {
        return super.setLocale(locale);
    }

    private getOrCreateWorkspaceEntry = (workspace: string): WorkspaceSettingsCacheEntry => {
        const cache = this.ctx.caches.workspaceSettings!;
        let cacheEntry = cache.get(workspace);

        if (!cacheEntry) {
            cacheEntry = {
                userWorkspaceSettings: new LRUCache<string, Promise<IUserWorkspaceSettings>>({
                    max: this.ctx.config.maxWorkspaceSettings!,
                }),
                workspaceSettings: new LRUCache<string, Promise<IWorkspaceSettings>>({
                    max: this.ctx.config.maxWorkspaceSettings!,
                }),
            };
            cache.set(workspace, cacheEntry);
        }

        return cacheEntry;
    };
}

//
// Attributes caching
//

function refMatchesMdObject(ref: ObjRef, mdObject: IMetadataObject, type?: ObjectType): boolean {
    return (
        areObjRefsEqual(ref, mdObject.ref) ||
        areObjRefsEqual(ref, idRef(mdObject.id, type)) ||
        areObjRefsEqual(ref, uriRef(mdObject.uri))
    );
}

const firstDefined = flow(compact, first);

function elementsCacheKey(
    ref: ObjRef,
    settings: {
        limit?: number;
        offset?: number;
        options?: IElementsQueryOptions;
        attributeFilters?: IElementsQueryAttributeFilter[];
        dateFilters?: IRelativeDateFilter[];
        measures?: IMeasure[];
    },
): string {
    return new SparkMD5().append(objRefToString(ref)).append(stringify(settings)).end();
}

function getOrCreateAttributeCache(ctx: CachingContext, workspace: string): AttributeCacheEntry {
    const cache = ctx.caches.workspaceAttributes!;
    let cacheEntry = cache.get(workspace);

    if (!cacheEntry) {
        cacheEntry = {
            displayForms: new LRUCache<string, Promise<IAttributeDisplayFormMetadataObject>>({
                max: ctx.config.maxAttributeDisplayFormsPerWorkspace!,
            }),
            attributesByDisplayForms: new LRUCache<string, Promise<IAttributeMetadataObject>>({
                max: ctx.config.maxAttributesPerWorkspace!,
            }),
            attributeElementResults: cachingEnabled(ctx.config.maxAttributeElementResultsPerWorkspace)
                ? new LRUCache<string, Promise<IElementsQueryResult>>({
                      max: ctx.config.maxAttributeElementResultsPerWorkspace!,
                  })
                : undefined,
        };
        cache.set(workspace, cacheEntry);
    }

    return cacheEntry;
}

class CachedElementsQuery extends DecoratedElementsQuery {
    constructor(
        decorated: IElementsQuery,
        private readonly ctx: CachingContext,
        private readonly workspace: string,
        private readonly ref: ObjRef,
        settings: {
            limit?: number;
            offset?: number;
            options?: IElementsQueryOptions;
            attributeFilters?: IElementsQueryAttributeFilter[];
            dateFilters?: IRelativeDateFilter[];
            measures?: IMeasure[];
        } = {},
    ) {
        super(decorated, settings);
    }

    public query = async (): Promise<IElementsQueryResult> => {
        const canCache = !this.settings.options?.filter;
        if (!canCache) {
            return super.query();
        }

        const cache = getOrCreateAttributeCache(this.ctx, this.workspace).attributeElementResults;
        invariant(cache, "inconsistent attribute element cache config");
        const cacheKey = elementsCacheKey(this.ref, this.settings);

        let result = cache.get(cacheKey);

        if (!result) {
            result = super.query().catch((e) => {
                cache.delete(cacheKey);
                throw e;
            });

            cache.set(cacheKey, result);
        }

        return result;
    };

    protected createNew(
        decorated: IElementsQuery,
        settings: {
            limit?: number | undefined;
            offset?: number | undefined;
            options?: IElementsQueryOptions | undefined;
            attributeFilters?: IElementsQueryAttributeFilter[] | undefined;
            dateFilters?: IRelativeDateFilter[] | undefined;
            measures?: IMeasure<IMeasureDefinitionType>[] | undefined;
        },
    ): IElementsQuery {
        return new CachedElementsQuery(decorated, this.ctx, this.workspace, this.ref, settings);
    }
}

class CachedElementsQueryFactory extends DecoratedElementsQueryFactory {
    constructor(
        decorated: IElementsQueryFactory,
        private readonly ctx: CachingContext,
        private readonly workspace: string,
    ) {
        super(decorated);
    }

    public forDisplayForm(ref: ObjRef): IElementsQuery {
        const decorated = this.decorated.forDisplayForm(ref);
        return new CachedElementsQuery(decorated, this.ctx, this.workspace, ref);
    }
}

class WithAttributesCaching extends DecoratedWorkspaceAttributesService {
    constructor(
        decorated: IWorkspaceAttributesService,
        private readonly ctx: CachingContext,
        private readonly workspace: string,
    ) {
        super(decorated);
    }

    public getAttributeDisplayForm = (ref: ObjRef): Promise<IAttributeDisplayFormMetadataObject> => {
        const cache = getOrCreateAttributeCache(this.ctx, this.workspace).displayForms;

        const idCacheKey = isIdentifierRef(ref) ? ref.identifier : undefined;
        const uriCacheKey = isUriRef(ref) ? ref.uri : undefined;

        let cacheItem = firstDefined([idCacheKey, uriCacheKey].map((key) => key && cache.get(key)));

        if (!cacheItem) {
            cacheItem = super.getAttributeDisplayForm(ref).catch((e) => {
                if (idCacheKey) {
                    cache.delete(idCacheKey);
                }
                if (uriCacheKey) {
                    cache.delete(uriCacheKey);
                }
                throw e;
            });

            if (idCacheKey) {
                cache.set(idCacheKey, cacheItem);
            }

            if (uriCacheKey) {
                cache.set(uriCacheKey, cacheItem);
            }
        }

        return cacheItem;
    };

    public getAttributeDisplayForms = async (
        refs: ObjRef[],
    ): Promise<IAttributeDisplayFormMetadataObject[]> => {
        const cache = getOrCreateAttributeCache(this.ctx, this.workspace).displayForms;

        // grab a reference to the cache results as soon as possible in case they would get evicted while loading the ones with missing data in cache
        // then would might not be able to call cache.get again and be guaranteed to get the data
        const refsWithCacheResults = refs.map(
            (ref): { ref: ObjRef; cacheHit: Promise<IAttributeDisplayFormMetadataObject> | undefined } => {
                const idCacheKey = isIdentifierRef(ref) ? ref.identifier : undefined;
                const uriCacheKey = isUriRef(ref) ? ref.uri : undefined;

                const cacheHit = firstDefined([idCacheKey, uriCacheKey].map((key) => key && cache.get(key)));

                return { ref, cacheHit };
            },
        );

        const [withCacheHits, withoutCacheHits] = partition(
            refsWithCacheResults,
            ({ cacheHit }) => !!cacheHit,
        );

        const refsToLoad = withoutCacheHits.map((item) => item.ref);

        const [alreadyInCache, loadedFromServer] = await Promise.all([
            // await the stuff from cache, we need the data available (we cannot just return the promises)
            Promise.all(withCacheHits.map((item) => item.cacheHit!)),
            // load items not in cache using the bulk operation
            this.decorated.getAttributeDisplayForms(refsToLoad),
        ]);

        // save newly loaded to cache for future reference
        loadedFromServer.forEach((loaded) => {
            const promisifiedResult = Promise.resolve(loaded);
            // save the cache item for both types of refs
            cache.set(loaded.id, promisifiedResult);
            cache.set(loaded.uri, promisifiedResult);
        });

        const loadedRefs = loadedFromServer.map((item) => item.ref);
        const outputRefs = this.ctx.capabilities.allowsInconsistentRelations
            ? skipMissingReferences(refs, refsToLoad, loadedRefs)
            : refs;

        // reconstruct the original ordering
        const candidates = [...loadedFromServer, ...alreadyInCache];

        return outputRefs.map((ref) => {
            const match = candidates.find((item) => refMatchesMdObject(ref, item, "displayForm"));
            // if this bombs, some data got lost in the process
            invariant(match);
            return match;
        });
    };

    public getAttributeByDisplayForm = async (ref: ObjRef): Promise<IAttributeMetadataObject> => {
        const cache = getOrCreateAttributeCache(this.ctx, this.workspace).attributesByDisplayForms;

        const idCacheKey = isIdentifierRef(ref) ? ref.identifier : undefined;
        const uriCacheKey = isUriRef(ref) ? ref.uri : undefined;

        let cacheItem = firstDefined([idCacheKey, uriCacheKey].map((key) => key && cache.get(key)));

        if (!cacheItem) {
            // eslint-disable-next-line sonarjs/no-identical-functions
            cacheItem = super.getAttributeByDisplayForm(ref).catch((e) => {
                if (idCacheKey) {
                    cache.delete(idCacheKey);
                }
                if (uriCacheKey) {
                    cache.delete(uriCacheKey);
                }
                throw e;
            });

            if (idCacheKey) {
                cache.set(idCacheKey, cacheItem);
            }

            if (uriCacheKey) {
                cache.set(uriCacheKey, cacheItem);
            }
        }

        return cacheItem;
    };

    public elements(): IElementsQueryFactory {
        const decorated = this.decorated.elements();
        return cachingEnabled(this.ctx.config.maxAttributeElementResultsPerWorkspace)
            ? new CachedElementsQueryFactory(decorated, this.ctx, this.workspace)
            : decorated;
    }
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

function cachedSecuritySettings(ctx: CachingContext): SecuritySettingsDecoratorFactory {
    return (original: ISecuritySettingsService) => new WithSecuritySettingsCaching(original, ctx);
}

function cachedWorkspaceSettings(ctx: CachingContext): WorkspaceSettingsDecoratorFactory {
    return (original, workspace) => new WithWorkspaceSettingsCaching(original, ctx, workspace);
}

function cachedAttributes(ctx: CachingContext): AttributesDecoratorFactory {
    return (original, workspace) => new WithAttributesCaching(original, ctx, workspace);
}

function cachingEnabled(desiredSize: number | undefined): boolean {
    return desiredSize !== undefined && desiredSize > 0;
}

function cacheControl(ctx: CachingContext): CacheControl {
    const control: CacheControl = {
        resetExecutions: () => {
            ctx.caches.execution?.clear();
        },

        resetCatalogs: () => {
            ctx.caches.workspaceCatalogs?.clear();
        },

        resetSecuritySettings: () => {
            ctx.caches.securitySettings?.clear();
        },

        resetAttributes: () => {
            ctx.caches.workspaceAttributes?.clear();
        },

        resetWorkspaceSettings: () => {
            ctx.caches.workspaceSettings?.clear();
        },

        resetAll: () => {
            control.resetExecutions();
            control.resetCatalogs();
            control.resetSecuritySettings();
            control.resetAttributes();
            control.resetWorkspaceSettings();
        },
    };

    return control;
}

//
// Public interface
//

/**
 * Cache control can be used to interact with the caching layer - at the moment to reset the contents of the
 * different top-level caches.
 *
 * @public
 */
export type CacheControl = {
    /**
     * Resets all execution caches.
     *
     * NOTE: this only resets the top-level caches. If your code holds onto execution results returned by
     * caching backend, those have additional sub-caches which _will not_ be impacted by this call.
     */
    resetExecutions: () => void;

    /**
     * Resets all catalog caches.
     */
    resetCatalogs: () => void;

    /**
     * Resets all organization security settings caches.
     */
    resetSecuritySettings: () => void;

    /**
     * Resets all workspace attribute caches.
     */
    resetAttributes: () => void;

    /**
     * Resets all workspace settings caches.
     */
    resetWorkspaceSettings: () => void;

    /**
     * Convenience method to reset all caches (calls all the particular resets).
     */
    resetAll: () => void;
};

/**
 * Specifies where should the caching decorator apply and to what size should caches grow.
 *
 * @public
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
    maxExecutions?: number;

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
    maxResultWindows?: number;

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
    maxCatalogs?: number;

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
     * Setting non-positive number here is invalid. If you want to turn off catalog caching, tweak the `maxCatalogs`.
     */
    maxCatalogOptions?: number;

    /**
     * Specify function to call once the caching is set up. If present, the function will be called
     * with an instance of {@link CacheControl} which you can use to interact with the caches.
     *
     * @param cacheControl - cache control instance
     */
    onCacheReady?: (cacheControl: CacheControl) => void;

    /**
     * Maximum number of organizations that will have its security settings cached. The scope string built by
     * particular backend implementation from organization ID will be used as cache key.
     *
     * When limit is reached, cache entries will be evicted using LRU policy.
     *
     * When no maximum number is specified, the cache will be unbounded and no evictions will happen. Unbounded
     * security settings organization cache is dangerous in applications with long-lived sessions that can
     * create many unique requests and memory usage will only go up.
     *
     * When non-positive number is specified, then no caching will be done.
     */
    maxSecuritySettingsOrgs?: number;

    /**
     * Maximum number of URLs per organization that will have its validation result cached. The URL
     * and validation context is used to form a cache key.
     *
     * When limit is reached, cache entries will be evicted using LRU policy.
     *
     * When no maximum number is specified, the cache will be unbounded and no evictions will happen. Unbounded
     * security settings organization URL cache is dangerous in applications with long-lived sessions that can
     * create many unique requests and memory usage will only go up.
     *
     * Setting non-positive number here is invalid. If you want to turn off organization security settings caching,
     * tweak the `maxSecuritySettingsOrgs`.
     */
    maxSecuritySettingsOrgUrls?: number;

    /**
     * Maximum age of cached organization's URL validation results. The value is in milliseconds.
     *
     * Items are not pro-actively pruned out as they age, but if you try to get an item that is too old,
     * it'll drop it and make a new request to the backend. The purpose of the cache setting is not mainly
     * to limit its size to prevent memory usage grow (tweak `maxSecuritySettingsOrgUrls` for that)
     * but to propagate URL whitelist changes on backend to the long-lived application sessions.
     *
     * Setting non-positive number here is invalid. If you want to turn off organization security settings
     * caching, tweak the `maxSecuritySettingsOrgs`.
     */
    maxSecuritySettingsOrgUrlsAge?: number;

    /**
     * Maximum number of workspaces for which to cache selected {@link @gooddata/sdk-backend-spi#IWorkspaceAttributesService} calls.
     * The workspace identifier is used as cache key.
     * For each workspace, there will be a cache entry holding `maxAttributeDisplayFormsPerWorkspace` entries for attribute display form-related calls.
     *
     * When limit is reached, cache entries will be evicted using LRU policy.
     *
     * When no maximum number is specified, the cache will be unbounded and no evictions will happen. Unbounded
     * cache may be OK in applications where number of workspaces is small - the cache will be limited
     * naturally and will not grow uncontrollably.
     *
     * When non-positive number is specified, then no caching will be done.
     */
    maxAttributeWorkspaces?: number;

    /**
     * Maximum number of attribute display forms to cache per workspace.
     *
     * When limit is reached, cache entries will be evicted using LRU policy.
     *
     * When no maximum number is specified, the cache will be unbounded and no evictions will happen. Unbounded
     * attribute display form cache may be OK in applications where number of attribute display forms is small
     * and/or they are requested infrequently - the cache will be limited naturally and will not grow uncontrollably.
     *
     * Setting non-positive number here is invalid. If you want to turn off attribute display form
     * caching, tweak the `maxAttributeWorkspaces` value.
     */
    maxAttributeDisplayFormsPerWorkspace?: number;

    /**
     * Maximum number of attributes to cache per workspace.
     *
     * When limit is reached, cache entries will be evicted using LRU policy.
     *
     * When no maximum number is specified, the cache will be unbounded and no evictions will happen. Unbounded
     * attribute cache may be OK in applications where number of attributes is small and/or they are requested
     * infrequently - the cache will be limited naturally and will not grow uncontrollably.
     *
     * Setting non-positive number here is invalid. If you want to turn off attribute caching,
     * tweak the `maxAttributeWorkspaces` value.
     */
    maxAttributesPerWorkspace?: number;

    /**
     * Maximum number of attribute element results to cache per workspace.
     *
     * Note that not all the queries are cached (e.g. queries with `filter` value).
     *
     * When limit is reached, cache entries will be evicted using LRU policy.
     *
     * When no maximum number is specified, the cache will be unbounded and no evictions will happen. Unbounded
     * attribute elements cache may be OK in applications where number of attributes and/or their elements is small
     * and/or they are requested infrequently - the cache will be limited naturally and will not grow uncontrollably.
     *
     * The `maxAttributeWorkspaces` value must be positive, otherwise this setting is ignored.
     * When non-positive number is specified, then no caching of attribute element results will be done.
     */
    maxAttributeElementResultsPerWorkspace?: number;

    /**
     * Maximum number of settings for a workspace and for a user to cache per workspace.
     *
     * When limit is reached, cache entries will be evicted using LRU policy.
     *
     * When no maximum number is specified, the cache will be unbounded and no evictions will happen. Unbounded
     * workspace settings cache is dangerous in applications that change query the settings of many different
     * workspaces - this will cache quite large objects for each workspace and can make the memory usage go up.
     *
     * When non-positive number is specified, then no caching of result windows will be done.
     */
    maxWorkspaceSettings?: number;
};

function assertPositiveOrUndefined(value: number | undefined, valueName: string) {
    invariant(
        value === undefined || value > 0,
        `${valueName} to cache must be positive or undefined, got: ${value}`,
    );
}

/**
 * These are the recommended settings for the backend caching.
 *
 * @remarks
 * For more information on what the options mean see {@link CachingConfiguration}.
 *
 * @public
 */
export const RecommendedCachingConfiguration: CachingConfiguration = {
    maxExecutions: 10,
    maxResultWindows: 5,
    maxCatalogs: 1,
    maxCatalogOptions: 50,
    maxSecuritySettingsOrgs: 3,
    maxSecuritySettingsOrgUrls: 100,
    maxSecuritySettingsOrgUrlsAge: 300_000, // 5 minutes
    maxAttributeWorkspaces: 1,
    maxAttributeDisplayFormsPerWorkspace: 100,
    maxAttributesPerWorkspace: 100,
    maxAttributeElementResultsPerWorkspace: 100,
    maxWorkspaceSettings: 1,
};

/**
 * Adds caching layer on top of an existing analytical backend instance. It is currently possible to cache
 * results of executions and the workspace LDM catalog.
 *
 * @remarks see {@link CachingConfiguration} properties for more information.
 * @param realBackend - real backend to decorate with caching
 * @param config - caching configuration. {@link RecommendedCachingConfiguration} can be used
 * @public
 */
export function withCaching(
    realBackend: IAnalyticalBackend,
    config: CachingConfiguration,
): IAnalyticalBackend {
    assertPositiveOrUndefined(config.maxCatalogOptions, "maxCatalogOptions");
    assertPositiveOrUndefined(config.maxSecuritySettingsOrgUrls, "maxSecuritySettingsOrgUrls");
    assertPositiveOrUndefined(config.maxSecuritySettingsOrgUrlsAge, "maxSecuritySettingsOrgUrlsAge");

    const execCaching = cachingEnabled(config.maxExecutions);
    const catalogCaching = cachingEnabled(config.maxCatalogs);
    const securitySettingsCaching = cachingEnabled(config.maxSecuritySettingsOrgs);
    const attributeCaching = cachingEnabled(config.maxAttributeWorkspaces);
    const workspaceSettingsCaching = cachingEnabled(config.maxWorkspaceSettings);

    const ctx: CachingContext = {
        caches: {
            execution: execCaching ? new LRUCache({ max: config.maxExecutions! }) : undefined,
            workspaceCatalogs: catalogCaching ? new LRUCache({ max: config.maxCatalogs! }) : undefined,
            securitySettings: securitySettingsCaching
                ? new LRUCache({ max: config.maxSecuritySettingsOrgs! })
                : undefined,
            workspaceAttributes: attributeCaching
                ? new LRUCache({ max: config.maxAttributeWorkspaces! })
                : undefined,
            workspaceSettings: workspaceSettingsCaching
                ? new LRUCache({ max: config.maxWorkspaceSettings! })
                : undefined,
        },
        config,
        capabilities: realBackend.capabilities,
    };

    const execution = execCaching ? cachedExecutions(ctx) : identity;
    const catalog = catalogCaching ? cachedCatalog(ctx) : identity;
    const securitySettings = securitySettingsCaching ? cachedSecuritySettings(ctx) : identity;
    const attributes = attributeCaching ? cachedAttributes(ctx) : identity;
    const workspaceSettings = workspaceSettingsCaching ? cachedWorkspaceSettings(ctx) : identity;

    if (config.onCacheReady) {
        config.onCacheReady(cacheControl(ctx));
    }

    return decoratedBackend(realBackend, {
        execution,
        catalog,
        securitySettings,
        attributes,
        workspaceSettings,
    });
}

function skipMissingReferences(
    requestedRefs: ObjRef[],
    refsToLoad: ObjRef[],
    refsLoadedFromServer: ObjRef[],
) {
    const missingRefs = refsToLoad.filter(
        (ref) => !refsLoadedFromServer.some((loadedRef) => areObjRefsEqual(loadedRef, ref)),
    );

    return requestedRefs.filter(
        (inputRef) => !missingRefs.some((missingRef) => areObjRefsEqual(missingRef, inputRef)),
    );
}
