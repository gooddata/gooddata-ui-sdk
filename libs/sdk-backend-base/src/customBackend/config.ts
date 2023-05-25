// (C) 2019-2022 GoodData Corporation
import {
    IAnalyticalBackendConfig,
    IDataView,
    IExecutionResult,
    IPreparedExecution,
} from "@gooddata/sdk-backend-spi";
import { IDimensionDescriptor } from "@gooddata/sdk-model";
import { AuthenticatedCallGuard } from "../toolkit/auth.js";
import { TelemetryData } from "../toolkit/backend.js";

/**
 * @beta
 */
export type ApiClientProvider = (config: CustomBackendConfig) => any;
/**
 * @beta
 */
export type ResultProvider = (context: ResultProviderContext) => Promise<IExecutionResult>;
/**
 * @beta
 */
export type DataProvider = (context: DataProviderContext) => Promise<IDataView>;
/**
 * @beta
 */
export type ResultFactory = (dimensions: IDimensionDescriptor[], fingerprint: string) => IExecutionResult;
/**
 * @beta
 */
export type CustomCallContext = {
    /**
     * Actual configuration of the backend.
     */
    config: CustomBackendConfig;

    /**
     * Essential backend state of the custom backend is passed down to providers.
     */
    state: CustomBackendState;

    /**
     * API client to use for backend communication. The custom backend obtains this
     * instance using the `clientProvider` specified in the custom backend configuration.
     *
     * Use this instance to communicate with the backend. You SHOULD NOT use the clientProvider to obtain
     * an instance of client. The custom backend implementation takes care of obtaining an instance
     * of client and uses the same instance to drive authentication flow as needed.
     */
    client: any;
};
/**
 * @beta
 */
export type ResultProviderContext = CustomCallContext & {
    /**
     * An execution that has been prepared and configured by the client code and describes what do compute
     * and how the results should look like.
     */
    execution: IPreparedExecution;

    /**
     * A factory function to create instances of IExecutionResult.
     *
     * When implementing custom backend, you may opt to use this factory to create a default implementation
     * of execution result which implements all the boilerplate and defers readAll() and readWindow() functions
     * to dataProviders OR create your own implementation of IExecutionResult from scratch.
     *
     */
    resultFactory: ResultFactory;
};
/**
 * @beta
 */
export type DataProviderContext = CustomCallContext & {
    /**
     * Execution result from which to obtain data.
     */
    result: IExecutionResult;

    /**
     * Indicates whether all data or just a window of data should be returned.
     *
     * If window is not defined, then all data are desired.
     */
    window?: {
        offset: number[];
        size: number[];
    };
};
/**
 * @beta
 */
export type CustomBackendConfig = IAnalyticalBackendConfig & {
    /**
     * Provider which will be called to obtain an instance of API client to talk to the backend server.
     */
    readonly clientProvider: ApiClientProvider;

    /**
     * Provider of execution results for particular execution definition - this triggers the actual
     * computation on the backend.
     *
     * The UI.SDK separates between the execution result and the actual data. The execution result is an umbrella
     * for the entire computation. It contains descriptors of the result dimensions and allows to obtain different
     * views on the data - be it different data windows (pages) or all data for the computation.
     *
     * ---
     *
     * Given the execution context, trigger computation on the backend and return an IExecutionResult
     * representing the result.
     *
     * The result provider must choose one of two approaches:
     *
     * 1. Use the resultFactory included in the context to create a default implementation of the IExecutionResult.
     * The default implementation includes all the boilerplate and uses `dataProvider` to obtain DataViews for
     * the {@link IExecutionResult#readAll} and {@link IExecutionResult#readWindow} methods.
     *
     * 2. Create its own implementation of IExecutionResult and instantiate as needed. In that case the the
     * `dataProvider` does not have to be specified.
     *
     * ---
     *
     * Note: if the provider encounters problems during execution, it MUST raise exceptions from the `AnalyticalBackendError`
     * error hierarchy.
     */
    readonly resultProvider: ResultProvider;

    /**
     * Provider of data for particular execution result.
     *
     * ---
     *
     * This property MUST be specified when your implementation of `resultProvider` uses the default implementation
     * of the IExecutionResult. Otherwise this property is optional. See description of `resultProvider` to learn more.
     *
     * ---
     *
     * Note: if the provider encounters problems during execution, it MUST raise exceptions from the `AnalyticalBackendError`
     * error hierarchy.
     *
     */
    readonly dataProvider?: DataProvider;
};

/**
 * @beta
 */
export type CustomBackendState = {
    /**
     * Telemetry available at the time of the provider call.
     */
    telemetry?: TelemetryData;

    /**
     * Authentication call guard.
     *
     * Always wrap custom calls to authenticated APIs in the call guard. That way if the client is not yet authenticated the
     * backend will trigger authentication flow and have authentication provider take care of the situation.
     *
     * Note that calls to `resultProvider` and `dataProvider` done by the custom backend infrastructure are already
     * wrapped by this and provide the `client` as part of their respective call contexts. Use that instance of `client`
     */
    authApiCall: AuthenticatedCallGuard;
};
