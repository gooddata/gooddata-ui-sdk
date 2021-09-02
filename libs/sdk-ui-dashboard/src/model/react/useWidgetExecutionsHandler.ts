// (C) 2021 GoodData Corporation
import { useCallback } from "react";
import { ObjRef, serializeObjRef } from "@gooddata/sdk-model";
import { IPushData, OnError, OnLoadingChanged } from "@gooddata/sdk-ui";
import { IExecutionResult } from "@gooddata/sdk-backend-spi";

import { executionResultsActions } from "../state/executionResults";

import { useDashboardDispatch } from "./DashboardStoreProvider";

/**
 * Provides callbacks to integrate with the executionResults slice.
 * @internal
 */
export function useWidgetExecutionsHandler(widgetRef: ObjRef) {
    const dispatch = useDashboardDispatch();
    const id = serializeObjRef(widgetRef);

    // TODO change to command
    const onError = useCallback<OnError>(
        (error) => {
            dispatch(
                executionResultsActions.upsertExecutionResult({
                    isLoading: false,
                    id,
                    error,
                    executionResult: undefined,
                }),
            );
        },
        [id],
    );

    const onSuccess = useCallback(
        (executionResult: IExecutionResult) => {
            dispatch(
                executionResultsActions.upsertExecutionResult({
                    isLoading: false,
                    id,
                    error: undefined,
                    executionResult,
                }),
            );
        },
        [id],
    );

    const onPushData = useCallback(
        (data: IPushData): void => {
            if (data.dataView) {
                onSuccess(data.dataView.result);
            }
        },
        [id, onSuccess],
    );

    const onLoadingChanged = useCallback<OnLoadingChanged>(
        ({ isLoading }) => {
            if (isLoading) {
                dispatch(
                    executionResultsActions.upsertExecutionResult({
                        isLoading: true,
                        id,
                        error: undefined,
                        executionResult: undefined,
                    }),
                );
            } else {
                dispatch(
                    executionResultsActions.upsertExecutionResult({
                        isLoading: false,
                        id,
                    }),
                );
            }
        },
        [id],
    );

    return {
        onLoadingChanged,
        onError,
        onSuccess,
        onPushData,
    };
}
