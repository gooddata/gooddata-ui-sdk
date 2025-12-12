// (C) 2007-2025 GoodData Corporation

import stringify from "json-stable-stringify";
import { compact, partition } from "lodash-es";
import { LRUCache } from "lru-cache";
import SparkMD5 from "spark-md5";
import { invariant } from "ts-invariant";

import {
    type AutomationFilterType,
    type AutomationType,
    type IAnalyticalBackend,
    type IAttributeWithReferences,
    type IAutomationsQuery,
    type IAutomationsQueryResult,
    type IBackendCapabilities,
    type ICollectionItemsConfig,
    type ICollectionItemsResult,
    type IDataView,
    type IElementsQuery,
    type IElementsQueryAttributeFilter,
    type IElementsQueryFactory,
    type IElementsQueryOptions,
    type IElementsQueryResult,
    type IExecutionFactory,
    type IExecutionResult,
    type IForecastConfig,
    type IForecastResult,
    type IGeoService,
    type IGeoStyleSpecification,
    type IGetAutomationOptions,
    type IGetAutomationsOptions,
    type IGetAutomationsQueryOptions,
    type IPreparedExecution,
    type IRawExportCustomOverrides,
    type ISecuritySettingsService,
    type IUserWorkspaceSettings,
    type IWorkspaceAttributesService,
    type IWorkspaceAutomationService,
    type IWorkspaceCatalog,
    type IWorkspaceCatalogFactory,
    type IWorkspaceCatalogFactoryOptions,
    type IWorkspaceSettings,
    type IWorkspaceSettingsService,
    type ValidationContext,
    isAbortError,
} from "@gooddata/sdk-backend-spi";
import {
    type IAbsoluteDateFilter,
    type IAlertDefault,
    type IAttributeDisplayFormMetadataObject,
    type IAttributeMetadataObject,
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IExecutionDefinition,
    type IGeoJsonFeature,
    type IMeasure,
    type IMeasureDefinitionType,
    type IMetadataObject,
    type IMetadataObjectBase,
    type IMetadataObjectIdentity,
    type IRelativeDateFilter,
    type ISeparators,
    type ObjRef,
    type ObjectType,
    areObjRefsEqual,
    geoFeatureId,
    idRef,
    isIdentifierRef,
    isUriRef,
    objRefToString,
    uriRef,
} from "@gooddata/sdk-model";

import { DecoratedWorkspaceAttributesService } from "../decoratedBackend/attributes.js";
import {
    DecoratedAutomationsQuery,
    DecoratedWorkspaceAutomationsService,
} from "../decoratedBackend/automations.js";
import { DecoratedWorkspaceCatalogFactory } from "../decoratedBackend/catalog.js";
import { DecoratedElementsQuery, DecoratedElementsQueryFactory } from "../decoratedBackend/elements.js";
import {
    DecoratedDataView,
    DecoratedExecutionFactory,
    DecoratedExecutionResult,
    DecoratedPreparedExecution,
    type PreparedExecutionWrapper,
} from "../decoratedBackend/execution.js";
import { decoratedBackend } from "../decoratedBackend/index.js";
import { DecoratedSecuritySettingsService } from "../decoratedBackend/securitySettings.js";
import {
    type AttributesDecoratorFactory,
    type AutomationsDecoratorFactory,
    type CatalogDecoratorFactory,
    type ExecutionDecoratorFactory,
    type GeoDecoratorFactory,
    type SecuritySettingsDecoratorFactory,
    type WorkspaceSettingsDecoratorFactory,
} from "../decoratedBackend/types.js";
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
    dataSetsMeta: LRUCache<string, Promise<IMetadataObject>>;
};

type AutomationCacheEntry = {
    automations: LRUCache<string, Promise<IAutomationMetadataObject[]>>;
    queries: LRUCache<string, Promise<IAutomationsQueryResult>>;
};

type CollectionItemsCacheEntry = {
    values: LRUCache<string, IGeoJsonFeature[]>;
    bbox?: number[];
    type?: string;
};

type CollectionItemsCache = LRUCache<string, CollectionItemsCacheEntry>;

type WorkspaceSettingsCacheEntry = {
    userWorkspaceSettings: LRUCache<string, Promise<IUserWorkspaceSettings>>;
    workspaceSettings: LRUCache<string, Promise<IWorkspaceSettings>>;
};

type GeoCacheEntry = {
    defaultStyle: Promise<IGeoStyleSpecification> | undefined;
};

type CachingContext = {
    caches: {
        execution?: LRUCache<string, ExecutionCacheEntry>;
        workspaceCatalogs?: LRUCache<string, CatalogCacheEntry>;
        securitySettings?: LRUCache<string, SecuritySettingsCacheEntry>;
        workspaceAttributes?: LRUCache<string, AttributeCacheEntry>;
        workspaceAutomations?: LRUCache<string, AutomationCacheEntry>;
        workspaceSettings?: LRUCache<string, WorkspaceSettingsCacheEntry>;
        geo?: GeoCacheEntry;
    };
    config: CachingConfiguration;
    capabilities: IBackendCapabilities;
};

//
// Execution caching
//

class WithExecutionCaching extends DecoratedPreparedExecution {
    constructor(
        decorated: IPreparedExecution,
        private readonly ctx: CachingContext,
    ) {
        super(decorated);
    }

    public override execute = async (): Promise<IExecutionResult> => {
        const cacheKey = this.fingerprint();
        const cache = this.ctx.caches.execution!;
        let cacheEntry = cache.get(cacheKey);
        // We need to delete the execution cache entry also if the result is cancelled,
        // to avoid 404 on result next time it's called
        // because cancel token provided from the backend was already used and we need
        // to retrieve the new one.
        const deleteExecutionCacheEntry = () => {
            cache.delete(cacheKey);
        };

        // If there is no cache entry and abort signal is provided,
        // we need cache execution only after successful resolution,
        // because running execution can be cancelled.
        if (this.signal) {
            if (!cacheEntry || this.signal.aborted) {
                try {
                    const result = await super.execute().then((res) => {
                        return new WithExecutionResultCaching(
                            res,
                            this.createNew,
                            this.ctx,
                            deleteExecutionCacheEntry,
                        );
                    });

                    cacheEntry = { result: Promise.resolve(result) };
                    cache.set(cacheKey, cacheEntry);
                } catch (e) {
                    deleteExecutionCacheEntry();
                    throw e;
                }
            } else {
                // In case of cache hit, we need to replace the signal in the result
                // because the signal might have changed since the result was cached
                const result = await cacheEntry.result;
                const resultWithCurrentSignal = result.withSignal(this.signal);
                cache.set(cacheKey, { result: Promise.resolve(resultWithCurrentSignal) });
                return new DefinitionSanitizingExecutionResult(
                    resultWithCurrentSignal,
                    this.createNew,
                    this.definition,
                );
            }
        } else {
            if (!cacheEntry) {
                const result = super
                    .execute()
                    .then((res) => {
                        return new WithExecutionResultCaching(
                            res,
                            this.createNew,
                            this.ctx,
                            deleteExecutionCacheEntry,
                        );
                    })
                    .catch((e) => {
                        deleteExecutionCacheEntry();
                        throw e;
                    });

                cacheEntry = { result };
                cache.set(cacheKey, cacheEntry);
            }
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

class WithCollectionItemsCachingDataView extends DecoratedDataView {
    constructor(
        decorated: IDataView,
        private readonly collectionItemsCache: CollectionItemsCache,
        private readonly maxValuesPerFilter: number,
    ) {
        super(decorated);
    }

    public override async readCollectionItems(
        config: ICollectionItemsConfig,
    ): Promise<ICollectionItemsResult> {
        const values = config.values?.filter((value): value is string => Boolean(value));
        if (!values?.length) {
            return super.readCollectionItems(config);
        }

        const normalizedValues = Array.from(new Set(values));
        const filterKey = collectionItemsFilterKey(config);

        let cacheEntry = this.collectionItemsCache.get(filterKey);
        if (!cacheEntry) {
            cacheEntry = this.createCollectionItemsCacheEntry();
            this.collectionItemsCache.set(filterKey, cacheEntry);
        }

        const cachedFeatures: IGeoJsonFeature[] = [];
        const missingValues: string[] = [];

        for (const value of normalizedValues) {
            if (!cacheEntry.values.has(value)) {
                missingValues.push(value);
                continue;
            }

            const cached = cacheEntry.values.get(value);
            if (cached?.length) {
                cachedFeatures.push(...cached);
            }
        }

        if (!missingValues.length) {
            return {
                type: cacheEntry.type ?? "FeatureCollection",
                features: cachedFeatures,
                bbox: cacheEntry.bbox,
            };
        }

        const fetchConfig: ICollectionItemsConfig = {
            ...config,
            values: missingValues,
            limit: Math.max(config.limit ?? missingValues.length, missingValues.length),
        };

        const freshResult = await super.readCollectionItems(fetchConfig);
        const { index, unmatched } = buildFeatureIndexByIdentifiers(freshResult.features ?? []);

        const newlyFetched: IGeoJsonFeature[] = [];

        for (const value of missingValues) {
            const featuresForValue = index.get(value);
            if (featuresForValue && featuresForValue.length > 0) {
                cacheEntry.values.set(value, featuresForValue);
                newlyFetched.push(...featuresForValue);
            } else {
                cacheEntry.values.set(value, []);
            }
        }

        if (freshResult.bbox) {
            cacheEntry.bbox = mergeBbox(cacheEntry.bbox, freshResult.bbox);
        }

        if (freshResult.type) {
            cacheEntry.type = freshResult.type;
        }

        return {
            type: cacheEntry.type ?? freshResult.type ?? "FeatureCollection",
            features: [...cachedFeatures, ...newlyFetched, ...unmatched],
            bbox: cacheEntry.bbox ?? freshResult.bbox,
        };
    }

    private createCollectionItemsCacheEntry(): CollectionItemsCacheEntry {
        return {
            values: new LRUCache({
                max: this.maxValuesPerFilter,
            }),
        };
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
        private readonly execWrapper: PreparedExecutionWrapper,
        private readonly execDefinitionOverride: IExecutionDefinition,
    ) {
        super(decorated, execWrapper);
        this.definition = execDefinitionOverride;
    }

    public override readAll = async (): Promise<IDataView> => {
        return this.withSanitizedDefinition(await super.readAll());
    };

    public override readWindow = async (offset: number[], size: number[]): Promise<IDataView> => {
        return this.withSanitizedDefinition(await super.readWindow(offset, size));
    };

    private withSanitizedDefinition = (original: IDataView): IDataView => {
        return new DefinitionSanitizingDataView(original, this);
    };

    protected createNew = (decorated: IExecutionResult): IExecutionResult => {
        return new DefinitionSanitizingExecutionResult(
            decorated,
            this.execWrapper,
            this.execDefinitionOverride,
        );
    };
}

function windowKey(offset: number[], size: number[]): string {
    return `o(${offset.join(",")})_s(${size.join(",")})`;
}

class WithExecutionResultCaching extends DecoratedExecutionResult {
    constructor(
        decorated: IExecutionResult,
        private readonly execWrapper: PreparedExecutionWrapper,
        private readonly ctx: CachingContext,
        private readonly deleteExecutionCacheEntry: () => void,
        private allData: Promise<IDataView> | undefined = undefined,
        private allForecastConfig: IForecastConfig | undefined = undefined,
        private allForecastData: Promise<IForecastResult> | undefined = undefined,
        private windows: LRUCache<string, Promise<IDataView>> | undefined = undefined,
        private collectionItemsCache: CollectionItemsCache | undefined = undefined,
    ) {
        super(decorated, execWrapper);

        if (cachingEnabled(this.ctx.config.maxResultWindows) && !this.windows) {
            this.windows = new LRUCache({ max: this.ctx.config.maxResultWindows! });
        }

        if (cachingEnabled(this.ctx.config.maxGeoCollectionItemsPerResult) && !this.collectionItemsCache) {
            this.collectionItemsCache = new LRUCache({
                max: this.ctx.config.maxGeoCollectionItemsPerResult!,
            });
        }
    }

    public override readAll = async (): Promise<IDataView> => {
        if (this.signal && (!this.allData || this.signal.aborted)) {
            try {
                const allData = await super.readAll();
                this.allData = Promise.resolve(this.wrapDataView(allData));
            } catch (err) {
                // If result was canceled, we need to delete also the execution cache entry,
                // to avoid 404 on result next time it's called,
                // because cancel token provided from the backend was already used and we need
                // to retrieve the new one.
                if (isAbortError(err)) {
                    this.deleteExecutionCacheEntry();
                }
                this.allData = undefined;
                throw err;
            }
        } else if (!this.allData) {
            this.allData = super
                .readAll()
                .then((dataView) => this.wrapDataView(dataView))
                .catch((e) => {
                    this.allData = undefined;
                    throw e;
                });
        }

        return this.allData;
    };

    public override readForecastAll = (config: IForecastConfig): Promise<IForecastResult> => {
        // TODO: enable forecasting caching size configuration
        if (!this.allForecastData || this.allForecastConfig !== config) {
            this.allForecastConfig = config;
            this.allForecastData = super.readForecastAll(config).catch((e) => {
                this.allForecastData = undefined;
                throw e;
            });
        }

        return this.allForecastData;
    };

    public override readWindow = async (offset: number[], size: number[]): Promise<IDataView> => {
        if (!this.windows) {
            return super.readWindow(offset, size).then((dataView) => this.wrapDataView(dataView));
        }

        const cacheKey = windowKey(offset, size);
        let window: Promise<IDataView> | undefined = this.windows.get(cacheKey);
        if (this.signal && (!window || this.signal.aborted)) {
            const result = await super.readWindow(offset, size).catch((e) => {
                if (this.windows) {
                    this.windows.delete(cacheKey);
                }
                if (isAbortError(e)) {
                    this.deleteExecutionCacheEntry();
                }

                throw e;
            });
            window = Promise.resolve(this.wrapDataView(result));
            this.windows.set(cacheKey, window);
        } else if (!window) {
            window = super
                .readWindow(offset, size)
                .then((dataView) => this.wrapDataView(dataView))
                .catch((e) => {
                    if (this.windows) {
                        this.windows.delete(cacheKey);
                    }

                    throw e;
                });
            this.windows.set(cacheKey, window);
        }

        return window;
    };

    protected createNew = (decorated: IExecutionResult): IExecutionResult => {
        return new WithExecutionResultCaching(
            decorated,
            this.execWrapper,
            this.ctx,
            this.deleteExecutionCacheEntry,
            this.allData,
            this.allForecastConfig,
            this.allForecastData,
            this.windows,
            this.collectionItemsCache,
        );
    };

    private wrapDataView = (dataView: IDataView): IDataView => {
        if (
            !this.collectionItemsCache ||
            !cachingEnabled(this.ctx.config.maxGeoCollectionItemsPerResult) ||
            dataView instanceof WithCollectionItemsCachingDataView
        ) {
            return dataView;
        }

        return new WithCollectionItemsCachingDataView(
            dataView,
            this.collectionItemsCache,
            this.ctx.config.maxGeoCollectionItemsPerResult!,
        );
    };
}

//
// Catalog caching
//

function optionsKey(options: IWorkspaceCatalogFactoryOptions): string {
    return stringify(options) || "undefined";
}

class WithCatalogCaching extends DecoratedWorkspaceCatalogFactory {
    constructor(
        decorated: IWorkspaceCatalogFactory,
        private readonly ctx: CachingContext,
    ) {
        super(decorated);
    }

    public override load = (): Promise<IWorkspaceCatalog> => {
        const cache = this.getOrCreateWorkspaceEntry(this.workspace).catalogForOptions;
        const cacheKey = optionsKey(this.options);
        let catalog = cache.get(cacheKey);

        if (!catalog) {
            catalog = super
                .load()
                .then((catalog) => {
                    catalog.attributes().forEach((catalogAttribute) => {
                        catalogAttribute.displayForms.forEach((displayForm) => {
                            this.cacheAttributeByDisplayForm(displayForm.ref, catalogAttribute.attribute);
                        });
                        if (catalogAttribute.dataSet) {
                            this.cacheAttributeDataSetMeta(
                                catalogAttribute.attribute.ref,
                                catalogAttribute.dataSet,
                            );
                        }
                    });
                    return catalog;
                })
                .catch((e) => {
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

    ///
    /// Caching of individual catalog objects
    ///
    private cacheAttributeByDisplayForm = (displayFormRef: ObjRef, attribute: IAttributeMetadataObject) => {
        const cache = getOrCreateAttributeCache(this.ctx, this.workspace).attributesByDisplayForms;

        const idCacheKey = isIdentifierRef(displayFormRef) ? displayFormRef.identifier : undefined;

        let cacheItem = idCacheKey && cache.get(idCacheKey);

        if (!cacheItem) {
            cacheItem = new Promise<IAttributeMetadataObject>((resolve) => resolve(attribute));

            if (idCacheKey) {
                cache.set(idCacheKey, cacheItem);
            }
        }

        return cacheItem;
    };

    private cacheAttributeDataSetMeta = (attributeRef: ObjRef, dataSet: IMetadataObject) => {
        const cache = getOrCreateAttributeCache(this.ctx, this.workspace).dataSetsMeta;

        const idCacheKey = isIdentifierRef(attributeRef) ? attributeRef.identifier : undefined;

        let cacheItem = idCacheKey && cache.get(idCacheKey);

        if (!cacheItem) {
            cacheItem = new Promise<IMetadataObject>((resolve) => resolve(dataSet));

            if (idCacheKey) {
                cache.set(idCacheKey, cacheItem);
            }
        }

        return cacheItem;
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
    constructor(
        decorated: ISecuritySettingsService,
        private readonly ctx: CachingContext,
    ) {
        super(decorated);
    }

    public override isUrlValid = (url: string, context: ValidationContext): Promise<boolean> => {
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

    public override isDashboardPluginUrlValid = (url: string, workspace: string): Promise<boolean> => {
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

    public override getSettings = (): Promise<IWorkspaceSettings> => {
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

    public override getSettingsForCurrentUser(): Promise<IUserWorkspaceSettings> {
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

    public override async setAlertDefault(value: IAlertDefault): Promise<void> {
        return super.setAlertDefault(value);
    }

    public override async setLocale(locale: string): Promise<void> {
        return super.setLocale(locale);
    }

    public override async setMetadataLocale(locale: string): Promise<void> {
        return super.setMetadataLocale(locale);
    }

    public override async setFormatLocale(locale: string): Promise<void> {
        return super.setFormatLocale(locale);
    }

    public override async setSeparators(separators: ISeparators): Promise<void> {
        return super.setSeparators(separators);
    }

    public override async setTimezone(timezone: string): Promise<void> {
        return super.setTimezone(timezone);
    }

    public override async setDateFormat(dateFormat: string): Promise<void> {
        return super.setDateFormat(dateFormat);
    }

    public override async setWeekStart(weekStart: string): Promise<void> {
        return super.setWeekStart(weekStart);
    }

    public override async setColorPalette(colorPaletteId: string): Promise<void> {
        return super.setColorPalette(colorPaletteId);
    }

    public override async setTheme(themeId: string): Promise<void> {
        return super.setTheme(themeId);
    }

    public override deleteColorPalette(): Promise<void> {
        return super.deleteColorPalette();
    }

    public override deleteTheme(): Promise<void> {
        return super.deleteTheme();
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

function firstDefined<T>(arr: T[]): T | undefined {
    return compact(arr).at(0);
}

function elementsCacheKey(
    ref: ObjRef,
    settings: {
        limit?: number;
        offset?: number;
        options?: IElementsQueryOptions;
        attributeFilters?: IElementsQueryAttributeFilter[];
        dateFilters?: (IRelativeDateFilter | IAbsoluteDateFilter)[];
        measures?: IMeasure[];
        validateBy?: ObjRef[];
    },
): string {
    const fingerprint = stringify(settings) || "undefined";
    return new SparkMD5().append(objRefToString(ref)).append(fingerprint).end();
}

function getOrCreateAttributeCache(ctx: CachingContext, workspace: string): AttributeCacheEntry {
    const cache = ctx.caches.workspaceAttributes!;
    let cacheEntry = cache.get(workspace);

    if (!cacheEntry) {
        cacheEntry = {
            dataSetsMeta: new LRUCache<string, Promise<IMetadataObject>>({
                max: ctx.config.maxAttributesPerWorkspace!,
            }),
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
            dateFilters?: (IRelativeDateFilter | IAbsoluteDateFilter)[];
            measures?: IMeasure[];
            validateBy?: ObjRef[];
        } = {},
    ) {
        super(decorated, settings);
    }

    public override query = async (): Promise<IElementsQueryResult> => {
        const canCache = !this.settings.options?.filter;
        if (!canCache) {
            return super.query();
        }

        const cache = getOrCreateAttributeCache(this.ctx, this.workspace).attributeElementResults;
        invariant(cache, "inconsistent attribute element cache config");
        const cacheKey = elementsCacheKey(this.ref, this.settings);

        const result = cache.get(cacheKey);

        //If no cache entry and we have signal, we need cache by result
        if (this.settings.signal) {
            if (!result) {
                try {
                    const res = await super.query();
                    cache.set(cacheKey, Promise.resolve(res));
                    return res;
                } catch (e) {
                    cache.delete(cacheKey);
                    throw e;
                }
            }
            return result;
        }

        //If no cache entry and no signal, we need cache by promise
        if (!result) {
            const promise = super.query().catch((e) => {
                cache.delete(cacheKey);
                throw e;
            });

            cache.set(cacheKey, promise);
            return promise;
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
            validateBy?: ObjRef[];
            signal?: AbortSignal;
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

    public override forDisplayForm(ref: ObjRef): IElementsQuery {
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

    public override getAttributeDisplayForm = (ref: ObjRef): Promise<IAttributeDisplayFormMetadataObject> => {
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
                cache.set(idCacheKey, cacheItem as Promise<IAttributeDisplayFormMetadataObject>);
            }

            if (uriCacheKey) {
                cache.set(uriCacheKey, cacheItem as Promise<IAttributeDisplayFormMetadataObject>);
            }
        }

        return cacheItem as Promise<IAttributeDisplayFormMetadataObject>;
    };

    public override getAttributeDisplayForms = async (
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

                return {
                    ref,
                    cacheHit: cacheHit as Promise<IAttributeDisplayFormMetadataObject> | undefined,
                };
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

    public override getAttributeByDisplayForm = async (ref: ObjRef): Promise<IAttributeMetadataObject> => {
        const cache = getOrCreateAttributeCache(this.ctx, this.workspace).attributesByDisplayForms;

        const idCacheKey = isIdentifierRef(ref) ? ref.identifier : undefined;
        const uriCacheKey = isUriRef(ref) ? ref.uri : undefined;

        let cacheItem = firstDefined([idCacheKey, uriCacheKey].map((key) => key && cache.get(key)));

        if (!cacheItem) {
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
                cache.set(idCacheKey, cacheItem as Promise<IAttributeMetadataObject>);
            }

            if (uriCacheKey) {
                cache.set(uriCacheKey, cacheItem as Promise<IAttributeMetadataObject>);
            }
        }

        return cacheItem as Promise<IAttributeMetadataObject>;
    };

    override getAttributeDatasetMeta = async (ref: ObjRef): Promise<IMetadataObject> => {
        const cache = getOrCreateAttributeCache(this.ctx, this.workspace).dataSetsMeta;

        const idCacheKey = isIdentifierRef(ref) ? ref.identifier : undefined;

        let cacheItem = idCacheKey && cache.get(idCacheKey);

        if (!cacheItem) {
            cacheItem = super.getAttributeDatasetMeta(ref).catch((e) => {
                if (idCacheKey) {
                    cache.delete(idCacheKey);
                }
                throw e;
            });

            if (idCacheKey) {
                cache.set(idCacheKey, cacheItem as Promise<IMetadataObject>);
            }
        }

        return cacheItem as Promise<IMetadataObject>;
    };

    override updateAttributeMeta(
        updatedAttribute: Partial<IMetadataObjectBase> & IMetadataObjectIdentity,
    ): Promise<IAttributeMetadataObject> {
        return this.decorated.updateAttributeMeta(updatedAttribute);
    }

    public override async getAttributesWithReferences(refs: ObjRef[]): Promise<IAttributeWithReferences[]> {
        const attributeByDfCache = getOrCreateAttributeCache(
            this.ctx,
            this.workspace,
        ).attributesByDisplayForms;
        const dataSetByAttributeCache = getOrCreateAttributeCache(this.ctx, this.workspace).dataSetsMeta;

        // grab a reference to the cache results as soon as possible in case they would get evicted while loading the ones with missing data in cache
        // then would might not be able to call cache.get again and be guaranteed to get the data
        const refsWithCacheResults: { ref: ObjRef; cacheHit?: Promise<IAttributeWithReferences> }[] = [];

        for (const ref of refs) {
            // First, get attribute cached by display form if available
            const attrCacheKey = isIdentifierRef(ref) ? ref.identifier : undefined;
            const attrCacheHit = attrCacheKey ? attributeByDfCache.get(attrCacheKey) : undefined;
            const attributeFromCache = attrCacheHit ? await attrCacheHit : undefined;

            // If attribute was cached, try to get dataSet by attribute from cache
            const dataSetCacheKey =
                attributeFromCache && isIdentifierRef(attributeFromCache.ref)
                    ? attributeFromCache.ref.identifier
                    : undefined;
            const dataSetCacheHit = dataSetCacheKey
                ? dataSetByAttributeCache.get(dataSetCacheKey)
                : undefined;
            const dataSetFromCache = dataSetCacheHit ? await dataSetCacheHit : undefined;

            // If both attribute and dataSet were cached, consider it as a cacheHit of attribute with references
            const cacheHit =
                attributeFromCache && dataSetFromCache
                    ? Promise.resolve({
                          attribute: attributeFromCache,
                          dataSet: dataSetFromCache,
                      } as IAttributeWithReferences)
                    : undefined;

            refsWithCacheResults.push({ ref, cacheHit });
        }

        const [withCacheHits, withoutCacheHits] = partition(
            refsWithCacheResults,
            ({ cacheHit }) => !!cacheHit,
        );

        const refsToLoad = withoutCacheHits.map((item) => item.ref);

        const [alreadyInCache, loadedFromServer] = await Promise.all([
            // await the stuff from cache, we need the data available (we cannot just return the promises)
            Promise.all(withCacheHits.map((item) => item.cacheHit!)),
            // load items not in cache using the bulk operation
            refsToLoad.length > 0
                ? this.decorated.getAttributesWithReferences(refsToLoad)
                : Promise.resolve([]),
        ]);

        // save newly loaded to cache for future reference
        loadedFromServer.forEach((loaded) => {
            // Cache attribute by display form refs
            loaded.attribute.displayForms.forEach((displayForm) => {
                this.cacheAttributeByDisplayForm(displayForm.ref, loaded.attribute);
            });

            // Cache dataSet by attribute ref
            if (loaded.dataSet) {
                this.cacheAttributeDataSetMeta(loaded.attribute.ref, loaded.dataSet);
            }
        });

        const loadedRefs = loadedFromServer.flatMap((item) =>
            item.attribute.displayForms.map((df) => df.ref),
        );
        const outputRefs = this.ctx.capabilities.allowsInconsistentRelations
            ? skipMissingReferences(refs, refsToLoad, loadedRefs)
            : refs;

        // reconstruct the original ordering
        const candidates = [...loadedFromServer, ...alreadyInCache];

        return outputRefs.map((ref) => {
            const match = candidates.find((item) =>
                item.attribute.displayForms.some((df) => areObjRefsEqual(ref, df.ref)),
            );
            // if this bombs, some data got lost in the process
            invariant(match);
            return match;
        });
    }

    private cacheAttributeByDisplayForm = (displayFormRef: ObjRef, attribute: IAttributeMetadataObject) => {
        const cache = getOrCreateAttributeCache(this.ctx, this.workspace).attributesByDisplayForms;

        const idCacheKey = isIdentifierRef(displayFormRef) ? displayFormRef.identifier : undefined;

        let cacheItem = idCacheKey && cache.get(idCacheKey);

        if (!cacheItem) {
            cacheItem = new Promise<IAttributeMetadataObject>((resolve) => resolve(attribute));

            if (idCacheKey) {
                cache.set(idCacheKey, cacheItem);
            }
        }

        return cacheItem;
    };

    private cacheAttributeDataSetMeta = (attributeRef: ObjRef, dataSet: IMetadataObject) => {
        const cache = getOrCreateAttributeCache(this.ctx, this.workspace).dataSetsMeta;

        const idCacheKey = isIdentifierRef(attributeRef) ? attributeRef.identifier : undefined;

        let cacheItem = idCacheKey && cache.get(idCacheKey);

        if (!cacheItem) {
            cacheItem = new Promise<IMetadataObject>((resolve) => resolve(dataSet));

            if (idCacheKey) {
                cache.set(idCacheKey, cacheItem);
            }
        }

        return cacheItem;
    };

    public override elements(): IElementsQueryFactory {
        const decorated = this.decorated.elements();
        return cachingEnabled(this.ctx.config.maxAttributeElementResultsPerWorkspace)
            ? new CachedElementsQueryFactory(decorated, this.ctx, this.workspace)
            : decorated;
    }
}

//AUTOMATIONS CACHING

function getOrCreateAutomationsCache(ctx: CachingContext, workspace: string): AutomationCacheEntry {
    const cache = ctx.caches.workspaceAutomations!;
    let cacheEntry = cache.get(workspace);

    if (!cacheEntry) {
        cacheEntry = {
            automations: new LRUCache<string, Promise<IAutomationMetadataObject[]>>({
                max: ctx.config.maxAutomationsWorkspaces!,
            }),
            queries: new LRUCache<string, Promise<IAutomationsQueryResult>>({
                max: ctx.config.maxAutomationsWorkspaces!,
            }),
        };
        cache.set(workspace, cacheEntry);
    }

    return cacheEntry;
}

class CachedAutomationsQueryFactory extends DecoratedAutomationsQuery {
    private settings: {
        size: number;
        page: number;
        author: string | null;
        recipient: string | null;
        externalRecipient: string | null;
        user: string | null;
        dashboard: string | null;
        status: string | null;
        filter: { title?: string };
        sort: NonNullable<unknown>;
        type: AutomationType | undefined;
        totalCount: number | undefined;
        authorFilterType: AutomationFilterType;
        recipientFilterType: AutomationFilterType;
        dashboardFilterType: AutomationFilterType;
        statusFilterType: AutomationFilterType;
    } = {
        size: 100,
        page: 0,
        author: null,
        recipient: null,
        externalRecipient: null,
        user: null,
        dashboard: null,
        status: null,
        filter: {},
        sort: {},
        type: undefined,
        totalCount: undefined,
        authorFilterType: "exact",
        recipientFilterType: "exact",
        dashboardFilterType: "exact",
        statusFilterType: "exact",
    };

    constructor(
        decorated: IAutomationsQuery,
        private readonly ctx: CachingContext,
        private readonly workspace: string,
    ) {
        super(decorated);
    }

    override withSize(size: number): IAutomationsQuery {
        this.settings.size = size;
        super.withSize(size);
        return this;
    }

    override withPage(page: number): IAutomationsQuery {
        this.settings.page = page;
        super.withPage(page);
        return this;
    }

    override withFilter(filter: { title?: string }): IAutomationsQuery {
        this.settings.filter = { ...filter };
        this.settings.totalCount = undefined;
        super.withFilter(filter);
        return this;
    }

    override withSorting(sort: string[]): IAutomationsQuery {
        this.settings.sort = { sort };
        super.withSorting(sort);
        return this;
    }

    override withType(type: AutomationType): IAutomationsQuery {
        this.settings.type = type;
        super.withType(type);
        return this;
    }

    override withAuthor(author: string, filterType = "exact" as AutomationFilterType): IAutomationsQuery {
        this.settings.author = author;
        super.withAuthor(author, filterType);
        return this;
    }

    override withRecipient(
        recipient: string,
        filterType = "exact" as AutomationFilterType,
    ): IAutomationsQuery {
        this.settings.recipient = recipient;
        super.withRecipient(recipient, filterType);
        return this;
    }

    override withExternalRecipient(externalRecipient: string): IAutomationsQuery {
        this.settings.externalRecipient = externalRecipient;
        super.withExternalRecipient(externalRecipient);
        return this;
    }

    override withUser(user: string): IAutomationsQuery {
        this.settings.user = user;
        super.withUser(user);
        return this;
    }

    override withDashboard(
        dashboard: string,
        filterType = "exact" as AutomationFilterType,
    ): IAutomationsQuery {
        this.settings.dashboard = dashboard;
        super.withDashboard(dashboard, filterType);
        return this;
    }

    override withStatus(status: string, filterType = "exact" as AutomationFilterType): IAutomationsQuery {
        this.settings.status = status;
        super.withStatus(status, filterType);
        return this;
    }

    public override query(): Promise<IAutomationsQueryResult> {
        const cache = getOrCreateAutomationsCache(this.ctx, this.workspace);
        const key = stringify(this.settings) || "undefined";

        const result = cache.queries.get(key);

        if (!result) {
            const promise = super.query().catch((e) => {
                cache.queries.delete(key);
                throw e;
            });

            cache.queries.set(key, promise);
            return promise;
        }

        return result;
    }

    override async queryAll(): Promise<IAutomationMetadataObject[]> {
        const firstQuery = await this.query();
        return firstQuery.all();
    }
}

class WithAutomationsCaching extends DecoratedWorkspaceAutomationsService {
    constructor(
        decorated: IWorkspaceAutomationService,
        private readonly ctx: CachingContext,
        private readonly workspace: string,
    ) {
        super(decorated);
    }

    public override getAutomations(options?: IGetAutomationsOptions): Promise<IAutomationMetadataObject[]> {
        const cache = getOrCreateAutomationsCache(this.ctx, this.workspace).automations;
        const key = stringify(options) || "undefined";

        const result = cache.get(key);

        if (!result) {
            const promise = super.getAutomations(options).catch((e) => {
                cache.delete(key);
                throw e;
            });

            cache.set(key, promise);
            return promise;
        }

        return result;
    }

    public override async createAutomation(
        automation: IAutomationMetadataObjectDefinition,
        options?: IGetAutomationOptions,
        widgetExecution?: IExecutionDefinition,
        overrides?: IRawExportCustomOverrides,
    ): Promise<IAutomationMetadataObject> {
        const cache = getOrCreateAutomationsCache(this.ctx, this.workspace);
        const result = await super.createAutomation(automation, options, widgetExecution, overrides);
        cache.automations.clear();
        cache.queries.clear();
        return result;
    }

    public override async updateAutomation(
        automation: IAutomationMetadataObject,
        options?: IGetAutomationOptions,
        widgetExecution?: IExecutionDefinition,
        overrides?: IRawExportCustomOverrides,
    ): Promise<IAutomationMetadataObject> {
        const cache = getOrCreateAutomationsCache(this.ctx, this.workspace);
        const result = await super.updateAutomation(automation, options, widgetExecution, overrides);
        cache.automations.clear();
        cache.queries.clear();
        return result;
    }

    public override async deleteAutomation(id: string): Promise<void> {
        const cache = getOrCreateAutomationsCache(this.ctx, this.workspace);
        await super.deleteAutomation(id);
        cache.automations.clear();
        cache.queries.clear();
    }

    public override async deleteAutomations(ids: string[]): Promise<void> {
        const cache = getOrCreateAutomationsCache(this.ctx, this.workspace);
        await super.deleteAutomations(ids);
        cache.automations.clear();
        cache.queries.clear();
    }

    public override async unsubscribeAutomation(id: string): Promise<void> {
        const cache = getOrCreateAutomationsCache(this.ctx, this.workspace);
        await super.unsubscribeAutomation(id);
        cache.automations.clear();
        cache.queries.clear();
    }

    public override async unsubscribeAutomations(ids: string[]): Promise<void> {
        const cache = getOrCreateAutomationsCache(this.ctx, this.workspace);
        await super.unsubscribeAutomations(ids);
        cache.automations.clear();
        cache.queries.clear();
    }

    public override async pauseAutomation(id: string): Promise<void> {
        const cache = getOrCreateAutomationsCache(this.ctx, this.workspace);
        await super.pauseAutomation(id);
        cache.automations.clear();
        cache.queries.clear();
    }

    public override async pauseAutomations(ids: string[]): Promise<void> {
        const cache = getOrCreateAutomationsCache(this.ctx, this.workspace);
        await super.pauseAutomations(ids);
        cache.automations.clear();
        cache.queries.clear();
    }

    public override async resumeAutomation(id: string): Promise<void> {
        const cache = getOrCreateAutomationsCache(this.ctx, this.workspace);
        await super.resumeAutomation(id);
        cache.automations.clear();
        cache.queries.clear();
    }

    public override async resumeAutomations(ids: string[]): Promise<void> {
        const cache = getOrCreateAutomationsCache(this.ctx, this.workspace);
        await super.resumeAutomations(ids);
        cache.automations.clear();
        cache.queries.clear();
    }

    override getAutomationsQuery(options?: IGetAutomationsQueryOptions): IAutomationsQuery {
        return new CachedAutomationsQueryFactory(
            super.getAutomationsQuery(options),
            this.ctx,
            this.workspace,
        );
    }
}

//
//
//

function collectionItemsFilterKey(config: ICollectionItemsConfig): string {
    return (
        stringify({
            collectionId: config.collectionId,
            bbox: config.bbox,
        }) || "collectionItems"
    );
}

function buildFeatureIndexByIdentifiers(features: IGeoJsonFeature[]): {
    index: Map<string, IGeoJsonFeature[]>;
    unmatched: IGeoJsonFeature[];
} {
    const index = new Map<string, IGeoJsonFeature[]>();
    const unmatched: IGeoJsonFeature[] = [];

    for (const feature of features) {
        const identifier = geoFeatureId(feature);

        if (!identifier) {
            unmatched.push(feature);
            continue;
        }

        const existingIndexEntry = index.get(identifier);
        if (existingIndexEntry) {
            existingIndexEntry.push(feature);
        } else {
            index.set(identifier, [feature]);
        }
    }

    return { index, unmatched };
}

function mergeBbox(a?: number[], b?: number[]): number[] | undefined {
    if (!a) {
        return b ? [...b] : undefined;
    }

    if (!b) {
        return [...a];
    }

    const length = Math.min(a.length, b.length);
    const merged = a.slice(0, length);

    for (let i = 0; i < length; i++) {
        merged[i] = i < length / 2 ? Math.min(a[i], b[i]) : Math.max(a[i], b[i]);
    }

    return merged;
}

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

function cachedAutomations(ctx: CachingContext): AutomationsDecoratorFactory {
    return (original, workspace) => new WithAutomationsCaching(original, ctx, workspace);
}

//
// Geo caching
//

class WithGeoCaching implements IGeoService {
    constructor(
        private readonly decorated: IGeoService,
        private readonly ctx: CachingContext,
    ) {}

    public getDefaultStyle(): Promise<IGeoStyleSpecification> {
        const cache = this.ctx.caches.geo!;
        let result = cache.defaultStyle;

        if (!result) {
            result = this.decorated.getDefaultStyle().catch((e: unknown) => {
                cache.defaultStyle = undefined;
                throw e;
            });
            cache.defaultStyle = result;
        }

        return result;
    }
}

function cachedGeo(ctx: CachingContext): GeoDecoratorFactory {
    return (original: IGeoService) => new WithGeoCaching(original, ctx);
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

        resetGeoStyles: () => {
            if (ctx.caches.geo) {
                ctx.caches.geo.defaultStyle = undefined;
            }
        },

        resetAll: () => {
            control.resetExecutions();
            control.resetCatalogs();
            control.resetSecuritySettings();
            control.resetAttributes();
            control.resetWorkspaceSettings();
            control.resetGeoStyles();
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
     * Resets the cached geo style.
     */
    resetGeoStyles: () => void;

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
     *
     * Note: When specified, this takes precedence over `maxExecutionsAge`.
     */
    maxExecutions?: number;

    /**
     * Maximum age of cached execution results. The value is in milliseconds.
     *
     * Items are not pro-actively pruned out as they age, but if you try to get an item that is too old,
     * it'll drop it and make a new request to the backend. The purpose of the cache setting is not mainly
     * to limit its size to prevent memory usage grow but to ensure that cached execution results are
     * refreshed periodically to reflect any data changes on the backend.
     *
     * Only used when `maxExecutions` is not specified.
     *
     * When non-positive number is specified, then no caching will be done.
     */
    maxExecutionsAge?: number;

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
     * Maximum number of cached geo collection items per execution result.
     *
     * @remarks
     * This limits how many unique combinations of collection filters and attribute values can be stored when
     * caching responses from {@link @gooddata/sdk-backend-spi#IDataView.readCollectionItems}. Once the number of
     * cached entries grows beyond this size, least recently used entries will be evicted.
     *
     * When non-positive number is specified, caching of collection items will be disabled.
     */
    maxGeoCollectionItemsPerResult?: number;

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
     * Maximum number of workspaces for which to cache selected {@link @gooddata/sdk-backend-spi#IWorkspaceAutomationsService} calls.
     * The workspace identifier is used as cache key.
     *
     * When limit is reached, cache entries will be evicted using LRU policy.
     *
     * When no maximum number is specified, the cache will be unbounded and no evictions will happen. Unbounded
     * cache may be OK in applications where number of workspaces is small - the cache will be limited
     * naturally and will not grow uncontrollably.
     *
     * When non-positive number is specified, then no caching will be done.
     */
    maxAutomationsWorkspaces?: number;

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

    /**
     * When true, cache the geo style returned by `backend.geo().getDefaultStyle()`.
     *
     * The geo style is the same for all workspaces within a single backend instance, so a single
     * cached entry is maintained. This is useful to avoid repeated network calls when multiple
     * geo charts are rendered on the same page.
     *
     * @remarks
     * Default is false. Set to true to enable caching.
     */
    cacheGeoStyles?: boolean;
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
    maxGeoCollectionItemsPerResult: 200,
    maxCatalogs: 1,
    maxCatalogOptions: 50,
    maxSecuritySettingsOrgs: 3,
    maxSecuritySettingsOrgUrls: 100,
    maxSecuritySettingsOrgUrlsAge: 300_000, // 5 minutes
    maxAttributeWorkspaces: 1,
    maxAttributeDisplayFormsPerWorkspace: 500,
    maxAttributesPerWorkspace: 500,
    maxAttributeElementResultsPerWorkspace: 100,
    maxWorkspaceSettings: 1,
    maxAutomationsWorkspaces: 1,
    cacheGeoStyles: true,
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
    assertPositiveOrUndefined(config.maxExecutions, "maxExecutions");
    assertPositiveOrUndefined(config.maxExecutionsAge, "maxExecutionsAge");
    assertPositiveOrUndefined(config.maxCatalogOptions, "maxCatalogOptions");
    assertPositiveOrUndefined(config.maxGeoCollectionItemsPerResult, "maxGeoCollectionItemsPerResult");
    assertPositiveOrUndefined(config.maxSecuritySettingsOrgUrls, "maxSecuritySettingsOrgUrls");
    assertPositiveOrUndefined(config.maxSecuritySettingsOrgUrlsAge, "maxSecuritySettingsOrgUrlsAge");

    const execCaching = cachingEnabled(config.maxExecutionsAge) || cachingEnabled(config.maxExecutions);
    const catalogCaching = cachingEnabled(config.maxCatalogs);
    const securitySettingsCaching = cachingEnabled(config.maxSecuritySettingsOrgs);
    const attributeCaching = cachingEnabled(config.maxAttributeWorkspaces);
    const workspaceSettingsCaching = cachingEnabled(config.maxWorkspaceSettings);
    const automationsCaching = cachingEnabled(config.maxAutomationsWorkspaces);
    const geoCaching = config.cacheGeoStyles === true;

    // Determine execution cache configuration: count-based (maxExecutions) takes precedence over time-based (maxExecutionsAge)
    const executionCacheOptions = cachingEnabled(config.maxExecutions)
        ? { max: config.maxExecutions! }
        : { max: 500, ttl: config.maxExecutionsAge! };

    const ctx: CachingContext = {
        caches: {
            execution: execCaching ? new LRUCache(executionCacheOptions) : undefined,
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
            workspaceAutomations: automationsCaching
                ? new LRUCache({ max: config.maxAutomationsWorkspaces! })
                : undefined,
            geo: geoCaching ? { defaultStyle: undefined } : undefined,
        },
        config,
        capabilities: realBackend.capabilities,
    };

    const execution = execCaching ? cachedExecutions(ctx) : (v: any) => v;
    const catalog = catalogCaching ? cachedCatalog(ctx) : (v: any) => v;
    const securitySettings = securitySettingsCaching ? cachedSecuritySettings(ctx) : (v: any) => v;
    const attributes = attributeCaching ? cachedAttributes(ctx) : (v: any) => v;
    const automations = automationsCaching ? cachedAutomations(ctx) : (v: any) => v;
    const workspaceSettings = workspaceSettingsCaching ? cachedWorkspaceSettings(ctx) : (v: any) => v;
    const geo = geoCaching ? cachedGeo(ctx) : undefined;

    if (config.onCacheReady) {
        config.onCacheReady(cacheControl(ctx));
    }

    return decoratedBackend(realBackend, {
        execution,
        catalog,
        securitySettings,
        attributes,
        workspaceSettings,
        automations,
        geo,
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
