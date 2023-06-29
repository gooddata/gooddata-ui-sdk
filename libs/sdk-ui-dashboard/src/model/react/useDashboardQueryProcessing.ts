// (C) 2020-2023 GoodData Corporation
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { GoodDataSdkError, UnexpectedSdkError } from "@gooddata/sdk-ui";

import { queryAndWaitFor } from "../store/index.js";
import { useDashboardDispatch } from "./DashboardStoreProvider.js";
import { DashboardQueries } from "../queries/index.js";
import {
    DashboardQueryFailed,
    DashboardQueryRejected,
    isDashboardQueryFailed,
    isDashboardQueryRejected,
} from "../events/index.js";

/**
 * @public
 */
export interface QueryProcessingPendingState {
    status: "pending";
    error: undefined;
    result: undefined;
}

/**
 * @public
 */
export interface QueryProcessingRunningState {
    status: "running";
    error: undefined;
    result: undefined;
}

/**
 * @public
 */
export interface QueryProcessingErrorState {
    status: "error";
    error: GoodDataSdkError;
    result: undefined;
}

/**
 * @public
 */
export interface QueryProcessingRejectedState {
    status: "rejected";
    error: undefined;
    result: undefined;
}

/**
 * @public
 */
export interface QueryProcessingSuccessState<TResult> {
    status: "success";
    error: undefined;
    result: TResult;
}

/**
 * @public
 */
export type QueryProcessingState<TResult> =
    | QueryProcessingPendingState
    | QueryProcessingRunningState
    | QueryProcessingErrorState
    | QueryProcessingRejectedState
    | QueryProcessingSuccessState<TResult>;

/**
 * @internal
 */
export type UseDashboardQueryProcessingResult<
    TQueryCreatorArgs extends any[],
    TQueryResult,
> = QueryProcessingState<TQueryResult> & {
    run: (...args: TQueryCreatorArgs) => void;
};

/**
 * @internal
 */
export type QueryProcessingStatus = QueryProcessingState<any>["status"];

/**
 * @internal
 */
export const useDashboardQueryProcessing = <
    TQuery extends DashboardQueries,
    TQueryResult,
    TQueryCreatorArgs extends any[],
>({
    queryCreator,
    onSuccess,
    onError,
    onRejected,
    onBeforeRun,
}: {
    queryCreator: (...args: TQueryCreatorArgs) => TQuery;
    onSuccess?: (result: TQueryResult) => void;
    onError?: (event: DashboardQueryFailed) => void;
    onRejected?: (event: DashboardQueryRejected) => void;
    onBeforeRun?: (query: TQuery) => void;
}): UseDashboardQueryProcessingResult<TQueryCreatorArgs, TQueryResult> => {
    const [state, setState] = useState<QueryProcessingState<TQueryResult>>({
        status: "pending",
        error: undefined,
        result: undefined,
    });
    const canceled = useRef(false);
    const dispatch = useDashboardDispatch();

    const run = useCallback<UseDashboardQueryProcessingResult<TQueryCreatorArgs, TQueryResult>["run"]>(
        (...args) => {
            if (canceled.current) {
                return;
            }

            let query = queryCreator(...args);

            if (!query.correlationId) {
                query = {
                    ...query,
                    correlationId: uuid(),
                };
            }

            if (!canceled.current) {
                setState({
                    status: "running",
                    result: undefined,
                    error: undefined,
                });
            }

            onBeforeRun?.(query);

            queryAndWaitFor<TQuery, TQueryResult>(dispatch, query)
                .then((result) => {
                    if (!canceled.current) {
                        setState({ status: "success", result, error: undefined });
                        onSuccess?.(result);
                    }
                })
                .catch((e) => {
                    if (!canceled.current) {
                        if (isDashboardQueryFailed(e)) {
                            setState({
                                status: "error",
                                result: undefined,
                                error: new UnexpectedSdkError(e.payload.message, e.payload.error),
                            });
                            onError?.(e);
                        } else if (isDashboardQueryRejected(e)) {
                            setState({ status: "rejected", result: undefined, error: undefined });
                            onRejected?.(e);
                        }
                    }
                });
        },
        [queryCreator, onSuccess, onError, onRejected, onBeforeRun],
    );

    // cancel any "in-flight" queries once the parent component is unmounting to prevent react warnings
    // about updating unmounted components
    useEffect(() => {
        return () => {
            canceled.current = true;
        };
    }, []);

    return {
        run,
        ...state,
    };
};
