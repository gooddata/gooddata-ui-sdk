// (C) 2019-2020 GoodData Corporation

export { dummyBackend, dummyBackendEmptyData, dummyDataView, DummyBackendConfig } from "./dummyBackend";

export {
    decoratedBackend,
    DecoratorFactories,
    CatalogDecoratorFactory,
    ExecutionDecoratorFactory,
} from "./decoratedBackend";

export {
    DecoratedExecutionFactory,
    PreparedExecutionWrapper,
    DecoratedPreparedExecution,
    DecoratedExecutionResult,
} from "./decoratedBackend/execution";

export {
    DecoratedWorkspaceCatalogFactory,
    DecoratedWorkspaceCatalog,
    WorkspaceCatalogWrapper,
} from "./decoratedBackend/catalog";

export { withEventing, AnalyticalBackendCallbacks } from "./eventingBackend";
export {
    withCaching,
    CachingConfiguration,
    DefaultCachingConfiguration,
    CacheControl,
} from "./cachingBackend";
export { withNormalization, NormalizationConfig, NormalizationWhenExecuteByRef } from "./normalizingBackend";
export { Normalizer, Denormalizer, NormalizationState, LocalIdMap } from "./normalizingBackend/normalizer";

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
} from "./ldmFactories/builder";
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

export { ResultHeaderTransformer, transformResultHeaders } from "./convertors/fromBackend/afm/result";
