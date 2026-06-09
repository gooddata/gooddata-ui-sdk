// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import { type IDataView, type IExecutionResult } from "@gooddata/sdk-backend-spi";
import { type IExecutionResultLimitBreak, type IResultWarning, type ObjRef } from "@gooddata/sdk-model";
import { type IPushData, type OnError, type OnLoadingChanged } from "@gooddata/sdk-ui";

import {
    setExecutionResultData,
    setExecutionResultError,
    setExecutionResultLoading,
} from "../commands/executionResults.js";

import { useDispatchDashboardCommand } from "./useDispatchDashboardCommand.js";

function getLimitBreaks(dataView: IDataView): IExecutionResultLimitBreak[] | undefined {
    const limitBreaks = dataView.metadata?.limitBreaks;
    return limitBreaks && limitBreaks.length > 0 ? [...limitBreaks] : undefined;
}

/**
 * Provides callbacks to integrate with the executionResults slice.
 * @internal
 */
export function useWidgetExecutionsHandler(widgetRef: ObjRef) {
    const startLoading = useDispatchDashboardCommand(setExecutionResultLoading);
    const setData = useDispatchDashboardCommand(setExecutionResultData);
    const setError = useDispatchDashboardCommand(setExecutionResultError);

    const onError = useCallback<OnError>(
        (error) => {
            setError(widgetRef, error);
        },
        [setError, widgetRef],
    );

    const onSuccess = useCallback(
        (
            executionResult: IExecutionResult,
            warnings: IResultWarning[] | undefined,
            limitBreaks?: IExecutionResultLimitBreak[],
        ) => {
            setData(widgetRef, executionResult, warnings, limitBreaks);
        },
        [setData, widgetRef],
    );

    const onPushData = useCallback(
        (data: IPushData): void => {
            if (data.dataView) {
                const limitBreaks = getLimitBreaks(data.dataView);
                onSuccess(data.dataView.result, data.dataView.warnings, limitBreaks);
            }
        },
        [onSuccess],
    );

    const onLoadingChanged = useCallback<OnLoadingChanged>(
        ({ isLoading }) => {
            if (isLoading) {
                startLoading(widgetRef);
            }
        },
        [startLoading, widgetRef],
    );

    return {
        onLoadingChanged,
        onError,
        onSuccess,
        onPushData,
    };
}
