// (C) 2022 GoodData Corporation
import { useEffect, useMemo } from "react";
import {
    DataViewFacade,
    GoodDataSdkError,
    IExecutionConfiguration,
    UnexpectedSdkError,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseState,
    useExecutionDataView,
} from "@gooddata/sdk-ui";

import { ICustomWidget } from "../../../model/index.js";

import { useWidgetFilters } from "./useWidgetFilters.js";

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
    const dataViewTask = useExecutionDataView({
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

    if (filterQueryTask.status === "pending" || dataViewTask.status === "pending") {
        return {
            error: undefined,
            result: undefined,
            status: "pending",
        };
    }

    if (filterQueryTask.status === "running" || dataViewTask.status === "loading") {
        return {
            error: undefined,
            result: undefined,
            status: "loading",
        };
    }

    if (filterQueryTask.status === "error" || dataViewTask.status === "error") {
        return {
            error: (filterQueryTask.error ?? dataViewTask.error)!,
            result: undefined,
            status: "error",
        };
    }

    if (filterQueryTask.status === "rejected") {
        return {
            error: rejectError!,
            result: undefined,
            status: "error",
        };
    }

    return {
        error: undefined,
        result: dataViewTask.result,
        status: "success",
    };
}
