// (C) 2025 GoodData Corporation
import { useMemo } from "react";
import {
    useBackendStrict,
    useWorkspaceStrict,
    useCancelablePromise,
    GoodDataSdkError,
    ILoadingState,
    IPushData,
    OnExportReady,
} from "@gooddata/sdk-ui";
import { getExecution, getPaginatedExecutionDataView } from "./getExecution.js";
import { ColumnHeadersPosition, IPivotTableNextProps, MeasureGroupDimension } from "../../types/public.js";
import { getAvailableDrillTargets } from "../drilling/getAvailableDrillTargets.js";
import { applyPivotTableDefaultProps, usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { handleExportReady } from "../exports/exports.js";
import { ICorePivotTableNextProps, IInitialExecutionData } from "../../types/internal.js";

/**
 * @alpha
 */
export const useInitExecution = (props: IPivotTableNextProps) => {
    const backend = useBackendStrict(props.backend, "useInitExecution");
    const workspace = useWorkspaceStrict(props.workspace, "useInitExecution");

    const {
        columns,
        rows,
        measures,
        filters,
        sortBy,
        totals,
        config: { measureGroupDimension },
    } = applyPivotTableDefaultProps(props as ICorePivotTableNextProps);

    return useMemo(
        () =>
            getExecution({
                backend,
                workspace,
                columns,
                rows,
                measures,
                filters,
                sortBy,
                totals,
                measureGroupDimension,
            }),
        [backend, workspace, columns, rows, measures, filters, sortBy, totals, measureGroupDimension],
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
 * Handles push data functionality by reading data view and preparing drill targets
 */
const handlePushData = async (
    initialExecutionData: IInitialExecutionData,
    pushData: (data: IPushData) => void,
    measureGroupDimension: MeasureGroupDimension,
    columnHeadersPosition: ColumnHeadersPosition,
): Promise<void> => {
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

/**
 * Processes successful execution result by handling callbacks
 */
const handleExecutionSuccess = async (
    initialExecutionData: IInitialExecutionData,
    callbacks: IExecutionResultCallbacks,
    options: IExecutionResultOptions,
): Promise<void> => {
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
            await handlePushData(
                initialExecutionData,
                pushData,
                measureGroupDimension,
                columnHeadersPosition,
            );
        }

        if (onExportReady) {
            handleExportReady(initialExecutionResult, onExportReady);
        }
    } catch (error) {
        console.error("Error processing execution result:", error);
    }
};

/**
 * @alpha
 */
export const useInitExecutionResult = () => {
    const props = usePivotTableProps();
    const { execution, onLoadingChanged, pushData, onExportReady, pageSize, config } = props;
    const { columnHeadersPosition, measureGroupDimension } = config;

    return useCancelablePromise<IInitialExecutionData, GoodDataSdkError>(
        {
            promise: async (signal) => {
                const initialExecutionResult = await execution.withSignal(signal).execute();
                const initialDataView = await getPaginatedExecutionDataView({
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
