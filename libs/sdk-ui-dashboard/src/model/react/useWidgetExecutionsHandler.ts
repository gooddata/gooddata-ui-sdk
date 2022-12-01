// (C) 2021-2022 GoodData Corporation
import { useCallback } from "react";
import { IResultWarning, ObjRef } from "@gooddata/sdk-model";
import { IPushData, OnError, OnLoadingChanged } from "@gooddata/sdk-ui";
import { IExecutionResult } from "@gooddata/sdk-backend-spi";

import { useDispatchDashboardCommand } from "./useDispatchDashboardCommand";
import { setExecutionResultData, setExecutionResultError, setExecutionResultLoading } from "../commands";

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
        [widgetRef],
    );

    const onSuccess = useCallback(
        (executionResult: IExecutionResult, warnings: IResultWarning[] | undefined) => {
            setData(widgetRef, executionResult, warnings);
        },
        [widgetRef],
    );

    const onPushData = useCallback(
        (data: IPushData): void => {
            if (data.dataView) {
                onSuccess(data.dataView.result, data.dataView.warnings);
            }
        },
        [widgetRef, onSuccess],
    );

    const onLoadingChanged = useCallback<OnLoadingChanged>(
        ({ isLoading }) => {
            if (isLoading) {
                startLoading(widgetRef);
            }
        },
        [widgetRef],
    );

    return {
        onLoadingChanged,
        onError,
        onSuccess,
        onPushData,
    };
}
