// (C) 2022-2025 GoodData Corporation

import { useEffect, useMemo } from "react";

import {
    type DataViewFacade,
    type GoodDataSdkError,
    type IExecutionConfiguration,
    UnexpectedSdkError,
    type UseCancelablePromiseCallbacks,
    type UseCancelablePromiseState,
    useExecutionDataView,
} from "@gooddata/sdk-ui";

import {
    type ICustomWidget,
    selectEnableExecutionCancelling,
    useDashboardSelector,
    useWidgetFilters,
} from "../../../model/index.js";

type DataViewResult = UseCancelablePromiseState<DataViewFacade, GoodDataSdkError>;

function createPendingResult(): DataViewResult {
    return {
        error: undefined,
        result: undefined,
        status: "pending",
    };
}

function createLoadingResult(): DataViewResult {
    return {
        error: undefined,
        result: undefined,
        status: "loading",
    };
}

function createErrorResult(error: GoodDataSdkError): DataViewResult {
    return {
        error,
        result: undefined,
        status: "error",
    };
}

function createSuccessResult(result: DataViewFacade | undefined): DataViewResult {
    return {
        error: undefined,
        result: result,
        status: "success",
    } as DataViewResult;
}

function computeDataViewResult(
    filterQueryTask: ReturnType<typeof useWidgetFilters>,
    dataViewTask: ReturnType<typeof useExecutionDataView>,
    rejectError: GoodDataSdkError | undefined,
): DataViewResult {
    const isPending = filterQueryTask.status === "pending" || dataViewTask.status === "pending";
    if (isPending) {
        return createPendingResult();
    }

    const isLoading = filterQueryTask.status === "running" || dataViewTask.status === "loading";
    if (isLoading) {
        return createLoadingResult();
    }

    const hasError = filterQueryTask.status === "error" || dataViewTask.status === "error";
    if (hasError) {
        return createErrorResult((filterQueryTask.error ?? dataViewTask.error)!);
    }

    if (filterQueryTask.status === "rejected") {
        return createErrorResult(rejectError!);
    }

    return createSuccessResult(dataViewTask.result);
}

/**
 * Configuration options for the {@link useCustomWidgetExecutionDataView} hook.
 *
 * @public
 */
export interface IUseCustomWidgetExecutionDataViewConfig {
    /**
     * Custom widget in the context of which the execution should be run. This affects which filters will be used.
     */
    widget: ICustomWidget;
    /**
     * Definition of the execution to execute (without filters). The filters will be filled automatically.
     *
     * @remarks
     * Note: When the execution is not provided, hook is locked in a "pending" state.
     */
    execution?: Exclude<IExecutionConfiguration, "filters">;

    /**
     * Enable or disable real execution cancellation.
     *
     * This means that if the execution request is not yet finished and the execution changes,
     * the request will be cancelled and the new execution will be started.
     */
    enableExecutionCancelling?: boolean;
}

/**
 * Callbacks for {@link useCustomWidgetExecutionDataView} hook.
 *
 * @public
 */
export type UseCustomWidgetExecutionDataViewCallbacks = UseCancelablePromiseCallbacks<
    DataViewFacade,
    GoodDataSdkError
>;

/**
 * This hook provides an easy way to read a data view from a custom widget. It resolves the appropriate filters
 * for the widget based on the filters currently set on the whole dashboard.
 *
 * @public
 */
export function useCustomWidgetExecutionDataView({
    enableExecutionCancelling,
    widget,
    execution,
    onCancel,
    onError,
    onLoading,
    onPending,
    onSuccess,
}: IUseCustomWidgetExecutionDataViewConfig &
    UseCustomWidgetExecutionDataViewCallbacks): UseCancelablePromiseState<DataViewFacade, GoodDataSdkError> {
    const filterQueryTask = useWidgetFilters(widget);
    const enableExecutionCancellingFF = useDashboardSelector(selectEnableExecutionCancelling);
    const effectiveExecutionCancelling = enableExecutionCancelling ?? enableExecutionCancellingFF;
    const dataViewTask = useExecutionDataView({
        enableExecutionCancelling: effectiveExecutionCancelling,
        execution: execution
            ? {
                  ...execution,
                  filters: filterQueryTask.result,
              }
            : undefined,
        onCancel,
        onError,
        onLoading,
        onPending,
        onSuccess,
    });

    const rejectError = useMemo(() => {
        if (filterQueryTask.status === "rejected") {
            return new UnexpectedSdkError("The widget filter query was rejected");
        }
        return undefined;
    }, [filterQueryTask.status]);

    useEffect(() => {
        if (filterQueryTask.status === "rejected" && rejectError) {
            onError?.(rejectError);
        }
    }, [filterQueryTask.status, onError, rejectError]);

    useEffect(() => {
        if (filterQueryTask.status === "error") {
            onError?.(filterQueryTask.error);
        }
    }, [filterQueryTask.error, filterQueryTask.status, onError]);

    return computeDataViewResult(filterQueryTask, dataViewTask, rejectError);
}
