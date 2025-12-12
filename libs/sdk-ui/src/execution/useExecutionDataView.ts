// (C) 2019-2025 GoodData Corporation

import { type DependencyList } from "react";

import { isEmpty } from "lodash-es";

import { type IAnalyticalBackend, type IPreparedExecution } from "@gooddata/sdk-backend-spi";

import { createExecution } from "./createExecution.js";
import { type DataViewWindow } from "./withExecutionLoading.js";
import {
    type AttributesMeasuresOrPlaceholders,
    type AttributesOrPlaceholders,
    DataViewFacade,
    type GoodDataSdkError,
    type NullableFiltersOrPlaceholders,
    type SortsOrPlaceholders,
    type TotalsOrPlaceholders,
    type UseCancelablePromiseCallbacks,
    type UseCancelablePromiseState,
    convertError,
    useBackendStrict,
    useCancelablePromise,
    useResolveValuesWithPlaceholders,
    useWorkspaceStrict,
} from "../base/index.js";

/**
 * Convenient interface to define execution by series and slices.
 *
 * @public
 */
export interface IExecutionConfiguration {
    /**
     * Data series will be built using the provided measures that are further scoped for
     * elements of the specified attributes.
     */
    seriesBy: AttributesMeasuresOrPlaceholders;

    /**
     * Slice all data series by elements of these attributes.
     */
    slicesBy?: AttributesOrPlaceholders;

    /**
     * Include these totals among the data slices.
     */
    totals?: TotalsOrPlaceholders;

    /**
     * Filters to apply on server side.
     */
    filters?: NullableFiltersOrPlaceholders;

    /**
     * Sorting to apply on server side.
     */
    sortBy?: SortsOrPlaceholders;

    /**
     * Resolution context for composed placeholders.
     */
    placeholdersResolutionContext?: any;

    /**
     * Informative name of the component.
     *
     * @remarks
     * This value is sent as telemetry information together with the actual execution request.
     * We recommend to set this because it can be useful for diagnostic purposes.
     *
     * Defaults 'Execute'.
     */
    componentName?: string;
}

/**
 * @internal
 */
function isExecutionConfiguration(obj: unknown): obj is IExecutionConfiguration {
    return !isEmpty(obj) && !!(obj as IExecutionConfiguration)?.seriesBy;
}

/**
 * Configuration for {@link useExecutionDataView} hook.
 * See also {@link UseExecutionDataViewCallbacks}.
 *
 * @public
 */
export interface IUseExecutionDataViewConfig {
    /**
     * Prepared execution, or execution configuration for which you want to get the data view.
     */
    execution?: IPreparedExecution | IExecutionConfiguration;

    /**
     * You can define only a specific "window" of data to load.
     *
     * @remarks
     * This is useful if you want to page data.
     */
    window?: DataViewWindow;

    /**
     * Backend to work with.
     *
     * @remarks
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the executor MUST be rendered within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace where execution should be executed.
     *
     * @remarks
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the executor MUST be rendered within an existing WorkspaceContext.
     */
    workspace?: string;

    /**
     * Optionally enable real execution cancellation.
     *
     * This means that if the execution request is not yet finished and the execution changes,
     * the request will be cancelled and the new execution will be started.
     *
     * Default: false
     */
    enableExecutionCancelling?: boolean;
}

/**
 * Callbacks for {@link useExecutionDataView} hook.
 *
 * @public
 */
export type UseExecutionDataViewCallbacks = UseCancelablePromiseCallbacks<DataViewFacade, GoodDataSdkError>;

/**
 * React hook to get data for a specific execution.
 *
 * @public
 */
export function useExecutionDataView(
    config: IUseExecutionDataViewConfig & UseExecutionDataViewCallbacks,
    deps?: DependencyList,
): UseCancelablePromiseState<DataViewFacade, GoodDataSdkError> {
    const {
        execution,
        window,
        enableExecutionCancelling = false,
        onCancel,
        onError,
        onLoading,
        onPending,
        onSuccess,
    } = config;
    const backend = useBackendStrict(config.backend, "useExecutionDataView");
    const workspace = useWorkspaceStrict(config.workspace, "useExecutionDataView");
    const effectiveDeps = deps ?? [];

    const propsToResolve = getExecutionConfigurationProps(config.execution);
    const [seriesBy, slicesBy, totals, filters, sortBy] = useResolveValuesWithPlaceholders(
        [
            propsToResolve.seriesBy,
            propsToResolve.slicesBy,
            propsToResolve.totals,
            propsToResolve.filters,
            propsToResolve.sortBy,
        ],
        propsToResolve.placeholdersResolutionContext,
    );

    const preparedExecution = isExecutionConfiguration(execution)
        ? createExecution({
              ...execution,
              seriesBy: seriesBy!,
              slicesBy,
              totals,
              filters,
              sortBy,
              backend,
              workspace,
          })
        : execution;

    return useCancelablePromise<DataViewFacade, GoodDataSdkError>(
        {
            enableAbortController: enableExecutionCancelling,
            promise: preparedExecution
                ? (signal) => {
                      let effectiveExecution = preparedExecution;
                      if (enableExecutionCancelling) {
                          effectiveExecution = preparedExecution.withSignal(signal);
                      }
                      return effectiveExecution
                          .execute()
                          .then((executionResult) =>
                              window
                                  ? executionResult.readWindow(window.offset, window.size)
                                  : executionResult.readAll(),
                          )
                          .then((dataView) => {
                              return DataViewFacade.for(dataView);
                          })
                          .catch((error) => {
                              throw convertError(error);
                          });
                  }
                : null,
            onCancel,
            onError,
            onLoading,
            onPending,
            onSuccess,
        },
        [
            backend,
            workspace,
            preparedExecution?.fingerprint() ?? "__executionFingerprint__",
            window?.offset ?? "__offset__",
            window?.size ?? "__size__",
            enableExecutionCancelling,
            ...effectiveDeps,
        ],
    );
}

/**
 * @internal
 */
function getExecutionConfigurationProps(
    execution?: IPreparedExecution | IExecutionConfiguration,
): Partial<IExecutionConfiguration> {
    if (isExecutionConfiguration(execution)) {
        return execution;
    }

    return {};
}
