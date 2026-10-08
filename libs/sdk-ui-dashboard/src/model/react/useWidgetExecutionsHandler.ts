// (C) 2021-2026 GoodData Corporation

import { useCallback, useRef } from "react";

import { type IDataView, type IExecutionResult, isNoDataError } from "@gooddata/sdk-backend-spi";
import {
    type IExecutionResultLimitBreak,
    type IResultWarning,
    type ObjRef,
    serializeObjRef,
} from "@gooddata/sdk-model";
import {
    type IPushData,
    type OnError,
    type OnLoadingChanged,
    isNoDataSdkError,
    isProtectedReport,
} from "@gooddata/sdk-ui";

import {
    setExecutionResultData,
    setExecutionResultError,
    setExecutionResultErrorWithResult,
    setExecutionResultLoading,
} from "../commands/executionResults.js";
import { restrictedDataActions } from "../store/restrictedData/index.js";
import { selectWidgetExecutionInputsKey } from "../store/restrictedData/restrictedDataSelectors.js";

import { useDashboardDispatch, useDashboardSelector } from "./DashboardStoreProvider.js";
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
    const dispatch = useDashboardDispatch();
    const inputsKey = useDashboardSelector(selectWidgetExecutionInputsKey(widgetRef));
    // the inputs of the running execution; the loader drops the outcome of an execution it replaced, so
    // an outcome reported here always belongs to them
    const executionInputsKey = useRef<string | undefined>(undefined);
    const startLoading = useDispatchDashboardCommand(setExecutionResultLoading);
    const setData = useDispatchDashboardCommand(setExecutionResultData);
    const setError = useDispatchDashboardCommand(setExecutionResultError);
    const setErrorWithResult = useDispatchDashboardCommand(setExecutionResultErrorWithResult);

    // Restrictions are recorded right away rather than through the command queue, so they keep the order
    // in which executions start and finish even when the queue is busy.
    const recordOutcome = useCallback(
        (isRefused: boolean) => {
            dispatch(
                isRefused
                    ? restrictedDataActions.executionRefused({
                          ref: widgetRef,
                          inputsKey: executionInputsKey.current ?? inputsKey,
                      })
                    : restrictedDataActions.clearRefusal(serializeObjRef(widgetRef)),
            );
        },
        [dispatch, inputsKey, widgetRef],
    );

    const onError = useCallback<OnError>(
        (error) => {
            recordOutcome(isProtectedReport(error));
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
        [recordOutcome, setError, setErrorWithResult, widgetRef],
    );

    const onSuccess = useCallback(
        (
            executionResult: IExecutionResult,
            warnings: IResultWarning[] | undefined,
            limitBreaks?: IExecutionResultLimitBreak[],
        ) => {
            recordOutcome(false);
            setData(widgetRef, executionResult, warnings, limitBreaks);
        },
        [recordOutcome, setData, widgetRef],
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
                executionInputsKey.current = inputsKey;
                startLoading(widgetRef);
            }
        },
        [inputsKey, startLoading, widgetRef],
    );

    return {
        onLoadingChanged,
        onError,
        onSuccess,
        onPushData,
    };
}
