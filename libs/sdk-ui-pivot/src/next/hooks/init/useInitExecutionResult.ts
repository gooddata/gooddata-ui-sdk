// (C) 2025 GoodData Corporation

import {
    GoodDataSdkError,
    ILoadingState,
    IPushData,
    OnDataView,
    OnExportReady,
    convertError,
    useCancelablePromise,
} from "@gooddata/sdk-ui";

import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { loadDataView } from "../../features/data/loadDataView.js";
import { getAvailableDrillTargets } from "../../features/drilling/getAvailableDrillTargets.js";
import { handleExportReady } from "../../features/exports/exports.js";
import { sanitizeSortInExecution } from "../../features/sorting/sanitizeSortInExecution.js";
import { IInitialExecutionData } from "../../types/internal.js";
import { ColumnHeadersPosition, MeasureGroupDimension } from "../../types/transposition.js";

/**
 * Initializes first execution result.
 *
 * @internal
 */
export const useInitExecutionResult = () => {
    const props = usePivotTableProps();
    const {
        execution,
        onLoadingChanged,
        onError,
        pushData,
        onExportReady,
        pageSize,
        config,
        onDataView,
        exportTitle,
    } = props;
    const { columnHeadersPosition, measureGroupDimension, enableExecutionCancelling } = config;

    return useCancelablePromise<IInitialExecutionData, GoodDataSdkError>(
        {
            promise: async (signal) => {
                try {
                    const initialExecutionResult = await execution.withSignal(signal).execute();
                    const initialDataView = await loadDataView({
                        executionResult: initialExecutionResult,
                        startRow: 0,
                        endRow: pageSize,
                    });
                    return { initialExecutionResult, initialDataView };
                } catch (e) {
                    // Ensure consumers always receive GoodDataSdkError
                    throw convertError(e);
                }
            },
            enableAbortController: !!enableExecutionCancelling,
            onLoading: onLoadingChanged ? () => onLoadingChanged({ isLoading: true }) : undefined,
            onSuccess: (initialExecutionData) =>
                handleExecutionSuccess(
                    initialExecutionData,
                    {
                        onExportReady,
                        onLoadingChanged,
                        pushData,
                        onDataView,
                    },
                    { columnHeadersPosition, measureGroupDimension, exportTitle },
                ),
            onError: (err) => {
                if (onLoadingChanged) {
                    onLoadingChanged({ isLoading: false });
                }
                onError?.(err);
            },
        },
        [sanitizeSortInExecution(execution).fingerprint()],
    );
};

/**
 * @alpha
 */
export interface IExecutionResultCallbacks {
    onLoadingChanged?: (loadingState: ILoadingState) => void;
    pushData?: (data: IPushData) => void;
    onExportReady?: OnExportReady;
    onDataView?: OnDataView;
}

/**
 * @alpha
 */
export interface IExecutionResultOptions {
    measureGroupDimension: MeasureGroupDimension;
    columnHeadersPosition: ColumnHeadersPosition;
    exportTitle?: string;
}

/**
 * Processes successful execution result by handling callbacks
 */
const handleExecutionSuccess = (
    initialExecutionData: IInitialExecutionData,
    callbacks: IExecutionResultCallbacks,
    options: IExecutionResultOptions,
) => {
    const { initialExecutionResult } = initialExecutionData;
    const { onLoadingChanged, pushData, onExportReady, onDataView } = callbacks;
    const { measureGroupDimension, columnHeadersPosition, exportTitle } = options;

    if (onLoadingChanged) {
        onLoadingChanged({ isLoading: false });
    }

    if (!pushData && !onExportReady && !onDataView) {
        return;
    }

    try {
        if (pushData) {
            handlePushData(initialExecutionData, pushData, measureGroupDimension, columnHeadersPosition);
        }

        if (onExportReady) {
            handleExportReady(initialExecutionResult, onExportReady, exportTitle);
        }

        if (onDataView) {
            onDataView(initialExecutionData.initialDataView);
        }
    } catch (error) {
        console.error("Error processing execution result:", error);
    }
};

/**
 * Handles push data functionality by reading data view and preparing drill targets
 */
const handlePushData = (
    initialExecutionData: IInitialExecutionData,
    pushData: (data: IPushData) => void,
    measureGroupDimension: MeasureGroupDimension,
    columnHeadersPosition: ColumnHeadersPosition,
) => {
    const { initialDataView } = initialExecutionData;
    const availableDrillTargets = getAvailableDrillTargets(
        initialDataView,
        measureGroupDimension,
        columnHeadersPosition,
    );

    pushData({
        dataView: initialDataView.dataView,
        availableDrillTargets,
    });
};
