// (C) 2025 GoodData Corporation
import {
    GoodDataSdkError,
    ILoadingState,
    IPushData,
    OnExportReady,
    useCancelablePromise,
} from "@gooddata/sdk-ui";

import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { loadDataView } from "../../features/data/loadDataView.js";
import { getAvailableDrillTargets } from "../../features/drilling/getAvailableDrillTargets.js";
import { handleExportReady } from "../../features/exports/exports.js";
import { IInitialExecutionData } from "../../types/internal.js";
import { ColumnHeadersPosition, MeasureGroupDimension } from "../../types/transposition.js";

/**
 * Initializes first execution result.
 *
 * @internal
 */
export const useInitExecutionResult = () => {
    const props = usePivotTableProps();
    const { execution, onLoadingChanged, pushData, onExportReady, pageSize, config } = props;
    const { columnHeadersPosition, measureGroupDimension } = config;

    return useCancelablePromise<IInitialExecutionData, GoodDataSdkError>(
        {
            promise: async (signal) => {
                const initialExecutionResult = await execution.withSignal(signal).execute();
                const initialDataView = await loadDataView({
                    executionResult: initialExecutionResult,
                    startRow: 0,
                    endRow: pageSize,
                });
                return { initialExecutionResult, initialDataView };
            },
            enableAbortController: true,
            onLoading: onLoadingChanged ? () => onLoadingChanged({ isLoading: true }) : undefined,
            onSuccess: (initialExecutionData) =>
                handleExecutionSuccess(
                    initialExecutionData,
                    { onExportReady, onLoadingChanged, pushData },
                    { columnHeadersPosition, measureGroupDimension },
                ),
            onError: onLoadingChanged ? () => onLoadingChanged({ isLoading: false }) : undefined,
        },
        [execution.fingerprint()],
    );
};

/**
 * @alpha
 */
export interface IExecutionResultCallbacks {
    onLoadingChanged?: (loadingState: ILoadingState) => void;
    pushData?: (data: IPushData) => void;
    onExportReady?: OnExportReady;
}

/**
 * @alpha
 */
export interface IExecutionResultOptions {
    measureGroupDimension: MeasureGroupDimension;
    columnHeadersPosition: ColumnHeadersPosition;
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
    const { onLoadingChanged, pushData, onExportReady } = callbacks;
    const { measureGroupDimension, columnHeadersPosition } = options;

    if (onLoadingChanged) {
        onLoadingChanged({ isLoading: false });
    }

    if (!pushData && !onExportReady) {
        return;
    }

    try {
        if (pushData) {
            handlePushData(initialExecutionData, pushData, measureGroupDimension, columnHeadersPosition);
        }

        if (onExportReady) {
            handleExportReady(initialExecutionResult, onExportReady);
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
