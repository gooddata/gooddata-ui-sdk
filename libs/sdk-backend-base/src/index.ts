// (C) 2019-2020 GoodData Corporation

export { dummyBackend, dummyBackendEmptyData, dummyDataView } from "./dummyBackend";

export { decoratedBackend, DecoratorFactories } from "./decoratedBackend";

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
export { withCaching, CachingConfiguration, DefaultCachingConfiguration } from "./cachingBackend";
export { withNormalization, NormalizationConfig } from "./normalizingBackend";
export { Normalizer, Denormalizer, NormalizationState } from "./normalizingBackend/normalizer";

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

export { AbstractExecutionFactory } from "./toolkit/execution";

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
