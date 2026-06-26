// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import { type IDataView, type IExecutionResult, isNoDataError } from "@gooddata/sdk-backend-spi";
import { type IExecutionResultLimitBreak, type IResultWarning, type ObjRef } from "@gooddata/sdk-model";
import { type IPushData, type OnError, type OnLoadingChanged, isNoDataSdkError } from "@gooddata/sdk-ui";

import {
    setExecutionResultData,
    setExecutionResultError,
    setExecutionResultErrorWithResult,
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
    const setErrorWithResult = useDispatchDashboardCommand(setExecutionResultErrorWithResult);

    const onError = useCallback<OnError>(
        (error) => {
            // A no-data error may carry the computed (empty) result, which has a valid resultId
            // (a result computed to emptiness, as opposed to e.g. an unsatisfiable filter that
            // never executes). When present, record both so consumers can reference the result
            // by id, while the error keeps the widget in its terminal no-data state.
            const noDataResult =
                isNoDataSdkError(error) && isNoDataError(error.cause)
                    ? error.cause.dataView?.result
                    : undefined;
            if (noDataResult) {
                setErrorWithResult({ id: widgetRef, error, executionResult: noDataResult });
            } else {
                setError(widgetRef, error);
            }
        },
        [setError, setErrorWithResult, widgetRef],
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
