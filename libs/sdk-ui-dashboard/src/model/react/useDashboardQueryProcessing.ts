// (C) 2020-2021 GoodData Corporation
import { useState } from "react";
import { GoodDataSdkError, UnexpectedSdkError } from "@gooddata/sdk-ui";

import { DashboardQueryCompleted, DashboardQueryFailed, DashboardQueryRejected } from "../events";
import { DashboardQueries } from "../queries";

import { useDashboardQuery } from "./useDashboardQuery";

/**
 * @internal
 */
export type QueryProcessingStatus = "running" | "success" | "error" | "rejected";

/**
 * @internal
 */
export const useDashboardQueryProcessing = <
    TQuery extends DashboardQueries,
    TQueryCreatorArgs extends any[],
    TResult,
>({
    queryCreator,
    onSuccess,
    onError,
    onRejected,
    onBeforeRun,
}: {
    queryCreator: (...args: TQueryCreatorArgs) => TQuery;
    onSuccess?: (event: DashboardQueryCompleted<TQuery, TResult>) => void;
    onError?: (event: DashboardQueryFailed) => void;
    onRejected?: (event: DashboardQueryRejected) => void;
    onBeforeRun?: (query: TQuery) => void;
}): {
    run: (...args: TQueryCreatorArgs) => void;
    status?: QueryProcessingStatus;
    result?: TResult;
    error?: GoodDataSdkError;
} => {
    const [state, setState] = useState<{
        result: TResult | undefined;
        status: QueryProcessingStatus;
        error: GoodDataSdkError | undefined;
    }>();
    const run = useDashboardQuery(
        queryCreator,
        {
            "GDC.DASH/EVT.QUERY.COMPLETED": (event: DashboardQueryCompleted<TQuery, TResult>) => {
                setState({ status: "success", result: event.payload.result, error: undefined });
                onSuccess?.(event);
            },
            "GDC.DASH/EVT.QUERY.FAILED": (event: DashboardQueryFailed) => {
                setState({
                    status: "error",
                    result: undefined,
                    error: new UnexpectedSdkError(event.payload.message, event.payload.error),
                });
                onError?.(event);
            },
            "GDC.DASH/EVT.QUERY.REJECTED": (event: DashboardQueryRejected) => {
                setState({ status: "rejected", result: undefined, error: undefined });
                onRejected?.(event);
            },
        },
        (cmd) => {
            setState({
                status: "running",
                result: undefined,
                error: undefined,
            });
            onBeforeRun?.(cmd);
        },
    );

    return {
        run,
        ...state,
    };
};
