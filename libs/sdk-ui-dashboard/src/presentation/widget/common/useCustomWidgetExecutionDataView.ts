// (C) 2022 GoodData Corporation
import {
    DataViewFacade,
    GoodDataSdkError,
    IExecutionConfiguration,
    UseCancelablePromiseState,
    useExecutionDataView,
} from "@gooddata/sdk-ui";

import { ICustomWidget } from "../../../model";

import { useWidgetFilters } from "./useWidgetFilters";

/**
 * Configuration options for the {@link useCustomWidgetExecutionDataView} hook.
 *
 * @beta
 */
export interface IUseCustomWidgetExecutionDataViewConfig {
    /**
     * Custom widget in the context of which the execution should be run. This affects which filters will be used.
     */
    widget: ICustomWidget;
    /**
     * Definition of the execution to execute (without filters). The filters will be filled automatically.
     *
     * Note: When the execution is not provided, hook is locked in a "pending" state.
     */
    execution?: Exclude<IExecutionConfiguration, "filters">;
}

/**
 * This hook provides an easy way to read a data view from a custom widget. It resolves the appropriate filters
 * for the widget based on the filters currently set on the whole dashboard.
 *
 * @beta
 */
export const useCustomWidgetExecutionDataView = ({
    widget,
    execution,
}: IUseCustomWidgetExecutionDataViewConfig): UseCancelablePromiseState<DataViewFacade, GoodDataSdkError> => {
    const { result: filters, status: filtersStatus, error: filtersError } = useWidgetFilters(widget);
    const { result, error, status } = useExecutionDataView({
        execution: execution
            ? {
                  ...execution,
                  filters,
              }
            : undefined,
    });

    if (!filtersStatus || status === "pending") {
        return {
            error: undefined,
            result: undefined,
            status: "pending",
        };
    }

    if (filtersStatus === "running" || status === "loading") {
        return {
            error: undefined,
            result: undefined,
            status: "loading",
        };
    }

    if (filtersError || error) {
        return {
            error: (error ?? filtersError)!,
            result: undefined,
            status: "error",
        };
    }

    return {
        error: undefined,
        result: result!,
        status: "success",
    };
};
