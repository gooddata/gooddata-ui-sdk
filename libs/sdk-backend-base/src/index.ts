// (C) 2019-2022 GoodData Corporation
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
    dummyBackend,
    dummyBackendEmptyData,
    dummyDataView,
    DummyBackendConfig,
} from "./dummyBackend/index.js";

export {
    decoratedBackend,
    DecoratorFactories,
    CatalogDecoratorFactory,
    ExecutionDecoratorFactory,
    SecuritySettingsDecoratorFactory,
    WorkspaceSettingsDecoratorFactory,
    AttributesDecoratorFactory,
    DashboardsDecoratorFactory,
} from "./decoratedBackend/index.js";

export {
    DecoratedExecutionFactory,
    PreparedExecutionWrapper,
    DecoratedPreparedExecution,
    DecoratedExecutionResult,
} from "./decoratedBackend/execution.js";

export { DecoratedWorkspaceDashboardsService } from "./decoratedBackend/dashboards.js";

export {
    DecoratedWorkspaceCatalogFactory,
    DecoratedWorkspaceCatalog,
    WorkspaceCatalogWrapper,
} from "./decoratedBackend/catalog.js";

export { DecoratedSecuritySettingsService } from "./decoratedBackend/securitySettings.js";

export { DecoratedWorkspaceSettingsService } from "./decoratedBackend/workspaceSettings.js";

export { withEventing, AnalyticalBackendCallbacks } from "./eventingBackend/index.js";
export {
    withCaching,
    CachingConfiguration,
    RecommendedCachingConfiguration,
    CacheControl,
} from "./cachingBackend/index.js";
export {
    withCustomWorkspaceSettings,
    WorkspaceSettingsConfiguration,
    SettingsWrapper,
    CurrentUserSettingsWrapper,
    CommonSettingsWrapper,
} from "./workspaceSettingsBackend/index.js";
export {
    withNormalization,
    NormalizationConfig,
    NormalizationWhenExecuteByRef,
} from "./normalizingBackend/index.js";
export {
    Normalizer,
    Denormalizer,
    NormalizationState,
    LocalIdMap,
    INormalizerOptions,
} from "./normalizingBackend/normalizer.js";

export {
    AuthenticatedAsyncCall,
    AuthenticatedCallGuard,
    AuthProviderCallGuard,
    IAuthenticatedAsyncCallContext,
    IAuthProviderCallGuard,
    NoopAuthProvider,
    AnonymousAuthProvider,
} from "./toolkit/auth.js";

export { TelemetryData } from "./toolkit/backend.js";

export {
    AbstractExecutionFactory,
    ExecutionFactoryWithFixedFilters,
    ExecutionFactoryUpgradingToExecByReference,
} from "./toolkit/execution.js";

export { InMemoryPaging, ServerPaging, IServerPagingResult, IServerPagingParams } from "./toolkit/paging.js";
export { validatePluginUrlIsSane } from "./toolkit/pluginUrlValidation.js";

export { customBackend } from "./customBackend/index.js";

export {
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
    Builder,
    BuilderConstructor,
    builderFactory,
    BuilderModifications,
    ExtractBuilderType,
    IBuilder,
    ValueOrUpdateCallback,
    resolveValueOrUpdateCallback,
} from "./ldmFactories/builder.js";
export {
    InsightWidgetBuilder,
    newInsightWidget,
    IInsightWidgetBuilder,
} from "./ldmFactories/dashboard/insightWidgetFactory.js";
export {
    KpiWidgetBuilder,
    newKpiWidget,
    IKpiWidgetBuilder,
} from "./ldmFactories/dashboard/kpiWidgetFactory.js";
export { IWidgetBaseBuilder, WidgetBaseBuilder } from "./ldmFactories/dashboard/widgetFactory.js";
export { CatalogAttributeBuilder, newCatalogAttribute } from "./ldmFactories/catalog/attributeFactory.js";
export {
    CatalogDateAttributeBuilder,
    CatalogDateDatasetBuilder,
    newCatalogDateAttribute,
    newCatalogDateDataset,
} from "./ldmFactories/catalog/dateDatasetFactory.js";
export { CatalogFactBuilder, newCatalogFact } from "./ldmFactories/catalog/factFactory.js";
export {
    CatalogGroupBuilder,
    GroupableCatalogItemBuilder,
    IGroupableCatalogItemBuilder,
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
export { IMetadataObjectBuilder, MetadataObjectBuilder } from "./ldmFactories/metadata/factory.js";
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

export { ResultHeaderTransformer, transformResultHeaders } from "./convertors/fromBackend/afm/result.js";
