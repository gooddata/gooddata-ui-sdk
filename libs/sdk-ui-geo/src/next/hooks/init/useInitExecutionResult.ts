// (C) 2025 GoodData Corporation

import {
    DataViewFacade,
    GoodDataSdkError,
    UseCancelablePromiseState,
    useExecutionDataView,
} from "@gooddata/sdk-ui";

import { useGeoPushpinProps } from "../../context/GeoPushpinPropsContext.js";

/**
 * Fetches execution result and returns data view facade.
 *
 * @remarks
 * This hook executes the prepared execution and returns the data view wrapped in a facade
 * for easier data access. It handles loading states, errors, and provides callbacks for
 * different stages of the data fetching process.
 *
 * @param config - Execution result configuration
 * @param deps - Additional dependencies for the hook
 * @returns Execution state with data view facade
 *
 * @alpha
 */
export function useInitExecutionResult(): UseCancelablePromiseState<DataViewFacade, GoodDataSdkError> {
    const { onLoadingChanged, onDataView, onError, backend, workspace, execution } = useGeoPushpinProps();

    return useExecutionDataView({
        backend,
        workspace,
        execution,
        enableExecutionCancelling: true,
        onLoading: () => {
            onLoadingChanged?.({
                isLoading: true,
            });
        },
        onSuccess: (dataView) => {
            onLoadingChanged?.({
                isLoading: false,
            });
            onDataView?.(dataView);
        },
        onError: (error) => {
            onLoadingChanged?.({
                isLoading: false,
            });
            onError?.(error);
        },
    });
}
