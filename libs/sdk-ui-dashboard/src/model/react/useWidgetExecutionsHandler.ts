// (C) 2021 GoodData Corporation
import { useCallback } from "react";
import { ObjRef } from "@gooddata/sdk-model";
import { IPushData, OnError, OnLoadingChanged } from "@gooddata/sdk-ui";
import { IExecutionResult } from "@gooddata/sdk-backend-spi";

import { widgetExecutionsActions } from "../state/widgetExecutions";

import { useDashboardDispatch } from "./DashboardStoreProvider";

/**
 * Provides callbacks to integrate with the _widgetExecutions slice.
 * @internal
 */
export function useWidgetExecutionsHandler(widgetRef: ObjRef) {
    const dispatch = useDashboardDispatch();

    const onError = useCallback<OnError>(
        (error) => {
            dispatch(
                widgetExecutionsActions.upsertExecution({
                    isLoading: false,
                    widgetRef,
                    error,
                    executionResult: undefined,
                }),
            );
        },
        [widgetRef],
    );

    const onSuccess = useCallback(
        (executionResult: IExecutionResult) => {
            dispatch(
                widgetExecutionsActions.upsertExecution({
                    isLoading: false,
                    widgetRef,
                    error: undefined,
                    executionResult,
                }),
            );
        },
        [widgetRef],
    );

    const onPushData = useCallback(
        (data: IPushData): void => {
            if (data.dataView) {
                onSuccess(data.dataView.result);
            }
        },
        [widgetRef, onSuccess],
    );

    const onLoadingChanged = useCallback<OnLoadingChanged>(
        ({ isLoading }) => {
            if (isLoading) {
                dispatch(
                    widgetExecutionsActions.upsertExecution({
                        isLoading: true,
                        widgetRef,
                        error: undefined,
                        executionResult: undefined,
                    }),
                );
            } else {
                dispatch(
                    widgetExecutionsActions.upsertExecution({
                        isLoading: false,
                        widgetRef,
                    }),
                );
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
