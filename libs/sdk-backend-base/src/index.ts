// (C) 2019-2026 GoodData Corporation

/**
 * This package provides foundational reusable code useful for building new or decorating existing Analytical Backend implementations.
 *
 * @remarks
 * The package includes several composable backend decorators and metadata object builders.
 * You can use them to either build your own Analytical Backend implementation or enhance existing
 * implementations (by adding caching, for example).
 *
 * @packageDocumentation
 */
export {
    type DummyBackendConfig,
    dummyBackend,
    dummyBackendEmptyData,
    dummyDataView,
} from "./dummyBackend/index.js";

export { DummySemanticSearchQueryBuilder } from "./dummyBackend/DummySemanticSearch.js";
export { DummyGenAIChatThread } from "./dummyBackend/DummyGenAIChatThread.js";

export { decoratedBackend } from "./decoratedBackend/index.js";

export type {
    DecoratorFactories,
    CatalogDecoratorFactory,
    ExecutionDecoratorFactory,
    SecuritySettingsDecoratorFactory,
    WorkspaceSettingsDecoratorFactory,
    AutomationsDecoratorFactory,
    AttributesDecoratorFactory,
    DashboardsDecoratorFactory,
    GeoDecoratorFactory,
} from "./decoratedBackend/types.js";

export {
    type PreparedExecutionWrapper,
    DecoratedExecutionFactory,
    DecoratedPreparedExecution,
    DecoratedExecutionResult,
} from "./decoratedBackend/execution.js";

export { DecoratedWorkspaceDashboardsService } from "./decoratedBackend/dashboards.js";

export {
    type WorkspaceCatalogWrapper,
    DecoratedWorkspaceCatalogFactory,
    DecoratedWorkspaceCatalog,
} from "./decoratedBackend/catalog.js";

export { DecoratedSecuritySettingsService } from "./decoratedBackend/securitySettings.js";

export { DecoratedWorkspaceSettingsService } from "./decoratedBackend/workspaceSettings.js";

export { type AnalyticalBackendCallbacks, withEventing } from "./eventingBackend/index.js";
export {
    type CachingConfiguration,
    type CacheControl,
    withCaching,
    RecommendedCachingConfiguration,
} from "./cachingBackend/index.js";
export {
    type IWorkspaceSettingsConfiguration,
    type SettingsWrapper,
    type CurrentUserSettingsWrapper,
    type CommonSettingsWrapper,
    withCustomWorkspaceSettings,
} from "./workspaceSettingsBackend/index.js";
export {
    type NormalizationConfig,
    type NormalizationWhenExecuteByRef,
    withNormalization,
} from "./normalizingBackend/index.js";
export {
    type NormalizationState,
    type LocalIdMap,
    type INormalizerOptions,
    Normalizer,
    Denormalizer,
} from "./normalizingBackend/normalizer.js";

export {
    type AuthenticatedAsyncCall,
    type AuthenticatedCallGuard,
    type IAuthenticatedAsyncCallContext,
    type IAuthProviderCallGuard,
    AuthProviderCallGuard,
    NoopAuthProvider,
    AnonymousAuthProvider,
} from "./toolkit/auth.js";

export type { TelemetryData } from "./toolkit/backend.js";

export {
    AbstractExecutionFactory,
    ExecutionFactoryWithFixedFilters,
    ExecutionFactoryUpgradingToExecByReference,
} from "./toolkit/execution.js";

export {
    type IServerPagingResult,
    type IServerPagingParams,
    InMemoryPaging,
    ServerPaging,
} from "./toolkit/paging.js";
export { validatePluginUrlIsSane } from "./toolkit/pluginUrlValidation.js";

export { customBackend } from "./customBackend/index.js";

export type {
    ResultProvider,
    ResultProviderContext,
    DataProvider,
    DataProviderContext,
    ApiClientProvider,
    CustomBackendConfig,
    CustomCallContext,
    ResultFactory,
    CustomBackendState,
} from "./customBackend/config.js";

export {
    type BuilderConstructor,
    type BuilderModifications,
    type ExtractBuilderType,
    type IBuilder,
    type ValueOrUpdateCallback,
    Builder,
    builderFactory,
    resolveValueOrUpdateCallback,
} from "./ldmFactories/builder.js";
export {
    type IInsightWidgetBuilder,
    InsightWidgetBuilder,
    newInsightWidget,
} from "./ldmFactories/dashboard/insightWidgetFactory.js";
export {
    type IKpiWidgetBuilder,
    KpiWidgetBuilder,
    newKpiWidget,
} from "./ldmFactories/dashboard/kpiWidgetFactory.js";
export { type IWidgetBaseBuilder, WidgetBaseBuilder } from "./ldmFactories/dashboard/widgetFactory.js";
export { CatalogAttributeBuilder, newCatalogAttribute } from "./ldmFactories/catalog/attributeFactory.js";
export {
    CatalogDateAttributeBuilder,
    CatalogDateDatasetBuilder,
    newCatalogDateAttribute,
    newCatalogDateDataset,
} from "./ldmFactories/catalog/dateDatasetFactory.js";
export { CatalogFactBuilder, newCatalogFact } from "./ldmFactories/catalog/factFactory.js";
export {
    type IGroupableCatalogItemBuilder,
    CatalogGroupBuilder,
    GroupableCatalogItemBuilder,
    newCatalogGroup,
} from "./ldmFactories/catalog/groupFactory.js";
export { CatalogMeasureBuilder, newCatalogMeasure } from "./ldmFactories/catalog/measureFactory.js";

export {
    AttributeMetadataObjectBuilder,
    newAttributeMetadataObject,
} from "./ldmFactories/metadata/attributeFactory.js";
export {
    DataSetMetadataObjectBuilder,
    newDataSetMetadataObject,
} from "./ldmFactories/metadata/dataSetFactory.js";
export {
    AttributeDisplayFormMetadataObjectBuilder,
    newAttributeDisplayFormMetadataObject,
} from "./ldmFactories/metadata/displayFormFactory.js";
export { type IMetadataObjectBuilder, MetadataObjectBuilder } from "./ldmFactories/metadata/factory.js";
export { newFactMetadataObject, FactMetadataObjectBuilder } from "./ldmFactories/metadata/factFactory.js";
export {
    MeasureMetadataObjectBuilder,
    newMeasureMetadataObject,
} from "./ldmFactories/metadata/measureFactory.js";
export {
    newVariableMetadataObject,
    VariableMetadataObjectBuilder,
} from "./ldmFactories/metadata/variableFactory.js";
export {
    newDashboardMetadataObject,
    DashboardMetadataObjectBuilder,
} from "./ldmFactories/metadata/dashboardFactory.js";

export { type ResultHeaderTransformer, transformResultHeaders } from "./convertors/fromBackend/afm/result.js";

export { generateDateFilterLocalIdentifier } from "./generators/dateFilterLocalIdentifier.js";
