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
export { dummyBackend, dummyBackendEmptyData, dummyDataView, DummyBackendConfig } from "./dummyBackend";

export {
    decoratedBackend,
    DecoratorFactories,
    CatalogDecoratorFactory,
    ExecutionDecoratorFactory,
    SecuritySettingsDecoratorFactory,
    WorkspaceSettingsDecoratorFactory,
    AttributesDecoratorFactory,
    DashboardsDecoratorFactory,
} from "./decoratedBackend";

export {
    DecoratedExecutionFactory,
    PreparedExecutionWrapper,
    DecoratedPreparedExecution,
    DecoratedExecutionResult,
} from "./decoratedBackend/execution";

export { DecoratedWorkspaceDashboardsService } from "./decoratedBackend/dashboards";

export {
    DecoratedWorkspaceCatalogFactory,
    DecoratedWorkspaceCatalog,
    WorkspaceCatalogWrapper,
} from "./decoratedBackend/catalog";

export { DecoratedSecuritySettingsService } from "./decoratedBackend/securitySettings";

export { DecoratedWorkspaceSettingsService } from "./decoratedBackend/workspaceSettings";

export { withEventing, AnalyticalBackendCallbacks } from "./eventingBackend";
export {
    withCaching,
    CachingConfiguration,
    DefaultCachingConfiguration,
    CacheControl,
} from "./cachingBackend";
export {
    withCustomWorkspaceSettings,
    WorkspaceSettingsConfiguration,
    SettingsWrapper,
    CurrentUserSettingsWrapper,
    CommonSettingsWrapper,
} from "./workspaceSettingsBackend";
export { withNormalization, NormalizationConfig, NormalizationWhenExecuteByRef } from "./normalizingBackend";
export {
    Normalizer,
    Denormalizer,
    NormalizationState,
    LocalIdMap,
    INormalizerOptions,
} from "./normalizingBackend/normalizer";

export {
    AuthenticatedAsyncCall,
    AuthenticatedCallGuard,
    AuthProviderCallGuard,
    IAuthenticatedAsyncCallContext,
    IAuthProviderCallGuard,
    NoopAuthProvider,
    AnonymousAuthProvider,
} from "./toolkit/auth";

export { TelemetryData } from "./toolkit/backend";

export {
    AbstractExecutionFactory,
    ExecutionFactoryWithFixedFilters,
    ExecutionFactoryUpgradingToExecByReference,
} from "./toolkit/execution";

export { InMemoryPaging, ServerPaging, IServerPagingResult, IServerPagingParams } from "./toolkit/paging";
export { validatePluginUrlIsSane } from "./toolkit/pluginUrlValidation";

export { customBackend } from "./customBackend";

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
} from "./customBackend/config";

export {
    Builder,
    BuilderConstructor,
    builderFactory,
    BuilderModifications,
    ExtractBuilderType,
    IBuilder,
    ValueOrUpdateCallback,
    resolveValueOrUpdateCallback,
} from "./ldmFactories/builder";
export {
    InsightWidgetBuilder,
    newInsightWidget,
    IInsightWidgetBuilder,
} from "./ldmFactories/dashboard/insightWidgetFactory";
export { KpiWidgetBuilder, newKpiWidget, IKpiWidgetBuilder } from "./ldmFactories/dashboard/kpiWidgetFactory";
export { IWidgetBaseBuilder, WidgetBaseBuilder } from "./ldmFactories/dashboard/widgetFactory";
export { CatalogAttributeBuilder, newCatalogAttribute } from "./ldmFactories/catalog/attributeFactory";
export {
    CatalogDateAttributeBuilder,
    CatalogDateDatasetBuilder,
    newCatalogDateAttribute,
    newCatalogDateDataset,
} from "./ldmFactories/catalog/dateDatasetFactory";
export { CatalogFactBuilder, newCatalogFact } from "./ldmFactories/catalog/factFactory";
export {
    CatalogGroupBuilder,
    GroupableCatalogItemBuilder,
    IGroupableCatalogItemBuilder,
    newCatalogGroup,
} from "./ldmFactories/catalog/groupFactory";
export { CatalogMeasureBuilder, newCatalogMeasure } from "./ldmFactories/catalog/measureFactory";

export {
    AttributeMetadataObjectBuilder,
    newAttributeMetadataObject,
} from "./ldmFactories/metadata/attributeFactory";
export {
    DataSetMetadataObjectBuilder,
    newDataSetMetadataObject,
} from "./ldmFactories/metadata/dataSetFactory";
export {
    AttributeDisplayFormMetadataObjectBuilder,
    newAttributeDisplayFormMetadataObject,
} from "./ldmFactories/metadata/displayFormFactory";
export { IMetadataObjectBuilder, MetadataObjectBuilder } from "./ldmFactories/metadata/factory";
export { newFactMetadataObject, FactMetadataObjectBuilder } from "./ldmFactories/metadata/factFactory";
export {
    MeasureMetadataObjectBuilder,
    newMeasureMetadataObject,
} from "./ldmFactories/metadata/measureFactory";
export {
    newVariableMetadataObject,
    VariableMetadataObjectBuilder,
} from "./ldmFactories/metadata/variableFactory";
export {
    newDashboardMetadataObject,
    DashboardMetadataObjectBuilder,
} from "./ldmFactories/metadata/dashboardFactory";

export { ResultHeaderTransformer, transformResultHeaders } from "./convertors/fromBackend/afm/result";
