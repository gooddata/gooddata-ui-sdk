// (C) 2021-2025 GoodData Corporation
import { useCallback } from "react";

import { type IExecutionResult } from "@gooddata/sdk-backend-spi";
import { type IResultWarning, type ObjRef } from "@gooddata/sdk-model";
import { type IPushData, type OnError, type OnLoadingChanged } from "@gooddata/sdk-ui";

import { useDispatchDashboardCommand } from "./useDispatchDashboardCommand.js";
import {
    setExecutionResultData,
    setExecutionResultError,
    setExecutionResultLoading,
} from "../commands/index.js";

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
        (executionResult: IExecutionResult, warnings: IResultWarning[] | undefined) => {
            setData(widgetRef, executionResult, warnings);
        },
        [setData, widgetRef],
    );

    const onPushData = useCallback(
        (data: IPushData): void => {
            if (data.dataView) {
                onSuccess(data.dataView.result, data.dataView.warnings);
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
