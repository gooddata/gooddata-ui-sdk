// (C) 2025 GoodData Corporation
import { useMemo } from "react";
import { IExecutionResult, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    useBackendStrict,
    useWorkspaceStrict,
    useCancelablePromise,
    GoodDataSdkError,
    ILoadingState,
    IPushData,
    OnExportReady,
    createExportFunction,
    DataViewFacade,
} from "@gooddata/sdk-ui";
import { getExecutionProps, getMeasureGroupDimension } from "../mapProps/props.js";
import { getExecution } from "../execution/getExecution.js";
import { IPivotTableNextProps } from "../types/public.js";
import { getAvailableDrillTargets } from "../drill/getAvailableDrillTargets.js";
import { COLUMNS_PER_PAGE, PAGE_SIZE } from "../constants/internal.js";

/**
 * @alpha
 */
export const useInitExecution = (props: IPivotTableNextProps) => {
    const backend = useBackendStrict(props.backend, "useInitExecution");
    const workspace = useWorkspaceStrict(props.workspace, "useInitExecution");
    const measureGroupDimension = useMemo(() => getMeasureGroupDimension(props), [props]);
    const { columns, rows, measures, filters, sortBy, totals } = useMemo(
        () => getExecutionProps(props),
        [props],
    );

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
    measureGroupDimension?: "columns" | "rows";
    columnHeadersPosition?: "left" | "top";
    pageSize?: number;
}

/**
 * Handles push data functionality by reading data view and preparing drill targets
 */
const handlePushData = async (
    result: IExecutionResult,
    pushData: (data: IPushData) => void,
    pageSize: number,
    measureGroupDimension?: "columns" | "rows",
    columnHeadersPosition?: "left" | "top",
): Promise<void> => {
    const dataView = await result.readWindow([0, 0], [pageSize, COLUMNS_PER_PAGE]);
    const dv = DataViewFacade.for(dataView);
    const availableDrillTargets = getAvailableDrillTargets(dv, measureGroupDimension, columnHeadersPosition);

    pushData({
        dataView: dv.dataView,
        availableDrillTargets,
    });
};

/**
 * Handles export ready functionality by creating export function
 */
const handleExportReady = (result: IExecutionResult, onExportReady: OnExportReady): void => {
    const exportFunction = createExportFunction(result, undefined);
    onExportReady(exportFunction);
};

/**
 * Processes successful execution result by handling callbacks
 */
const handleExecutionSuccess = async (
    result: IExecutionResult,
    callbacks: IExecutionResultCallbacks,
    options: IExecutionResultOptions,
): Promise<void> => {
    const { onLoadingChanged, pushData, onExportReady } = callbacks;
    const { measureGroupDimension, columnHeadersPosition, pageSize = PAGE_SIZE } = options;

    if (onLoadingChanged) {
        onLoadingChanged({ isLoading: false });
    }

    if (!pushData && !onExportReady) {
        return;
    }

    try {
        if (pushData) {
            await handlePushData(result, pushData, pageSize, measureGroupDimension, columnHeadersPosition);
        }

        if (onExportReady) {
            handleExportReady(result, onExportReady);
        }
    } catch (error) {
        console.error("Error processing execution result:", error);
    }
};

/**
 * @alpha
 */
export const useInitExecutionResult = (
    execution: IPreparedExecution,
    callbacks: IExecutionResultCallbacks = {},
    options: IExecutionResultOptions = {},
) => {
    const { onLoadingChanged } = callbacks;

    return useCancelablePromise<IExecutionResult, GoodDataSdkError>(
        {
            promise: (signal) => execution.withSignal(signal).execute(),
            enableAbortController: true,
            onLoading: onLoadingChanged ? () => onLoadingChanged({ isLoading: true }) : undefined,
            onSuccess: (result) => handleExecutionSuccess(result, callbacks, options),
            onError: onLoadingChanged ? () => onLoadingChanged({ isLoading: false }) : undefined,
        },
        [execution.fingerprint()],
    );
};
