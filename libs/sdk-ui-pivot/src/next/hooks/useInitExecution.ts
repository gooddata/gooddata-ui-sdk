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
    const measureGroupDimension = getMeasureGroupDimension(props);
    const { columns, rows, measures, filters, sortBy } = getExecutionProps(props);

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
                measureGroupDimension,
            }),
        [backend, workspace, columns, rows, measures, filters, sortBy, measureGroupDimension],
    );
};

/**
 * @alpha
 */
export const useInitExecutionResult = (
    execution: IPreparedExecution,
    callbacks?: {
        onLoadingChanged?: (loadingState: ILoadingState) => void;
        pushData?: (data: IPushData) => void;
        onExportReady?: OnExportReady;
        measureGroupDimension?: "columns" | "rows";
        columnHeadersPosition?: "left" | "top";
        pageSize?: number;
    },
) => {
    const {
        onLoadingChanged,
        pushData,
        onExportReady,
        measureGroupDimension,
        columnHeadersPosition,
        pageSize = PAGE_SIZE,
    } = callbacks || {};

    return useCancelablePromise<IExecutionResult, GoodDataSdkError>(
        {
            promise: (signal) => execution.withSignal(signal).execute(),
            enableAbortController: true,
            onLoading: onLoadingChanged ? () => onLoadingChanged({ isLoading: true }) : undefined,
            onSuccess: (result) => {
                if (onLoadingChanged) {
                    onLoadingChanged({ isLoading: false });
                }

                if (pushData || onExportReady) {
                    result
                        .readWindow([0, 0], [pageSize, COLUMNS_PER_PAGE])
                        .then((dataView) => {
                            const dv = DataViewFacade.for(dataView);

                            if (pushData) {
                                const availableDrillTargets = getAvailableDrillTargets(
                                    dv,
                                    measureGroupDimension,
                                    columnHeadersPosition,
                                );
                                pushData({
                                    dataView: dv.dataView,
                                    availableDrillTargets,
                                });
                            }

                            if (onExportReady) {
                                const exportFunction = createExportFunction(result, undefined);
                                onExportReady(exportFunction);
                            }
                        })
                        .catch((error) => {
                            console.error("Error reading data view for pushData:", error);
                        });
                }
            },
            onError: onLoadingChanged ? () => onLoadingChanged({ isLoading: false }) : undefined,
        },
        [execution.fingerprint()],
    );
};
