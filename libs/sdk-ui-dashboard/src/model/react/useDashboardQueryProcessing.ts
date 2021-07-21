// (C) 2020-2021 GoodData Corporation
import { useState } from "react";

import { DashboardQueryCompleted, DashboardQueryFailed, DashboardQueryRejected } from "../events";
import { DashboardQueries } from "../queries";

import { useDashboardQuery } from "./useDashboardQuery";

/**
 * @internal
 */
export type QueryProcessingStatus = "running" | "success" | "error";

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
    onBeforeRun,
}: {
    queryCreator: (...args: TQueryCreatorArgs) => TQuery;
    onSuccess?: (event: DashboardQueryCompleted<TQuery, TResult>) => void;
    onError?: (event: DashboardQueryFailed | DashboardQueryRejected) => void;
    onBeforeRun?: (query: TQuery) => void;
}): {
    run: (...args: TQueryCreatorArgs) => void;
    status?: QueryProcessingStatus;
    result?: TResult;
} => {
    const [state, setState] = useState<{ result: TResult | undefined; status: QueryProcessingStatus }>();
    const run = useDashboardQuery(
        queryCreator,
        {
            "GDC.DASH/EVT.QUERY.COMPLETED": (event: DashboardQueryCompleted<TQuery, TResult>) => {
                setState({ status: "success", result: event.payload.result });
                onSuccess?.(event);
            },
            "GDC.DASH/EVT.QUERY.FAILED": (event: DashboardQueryFailed) => {
                setState({ status: "error", result: undefined });
                onError?.(event);
            },
            "GDC.DASH/EVT.QUERY.REJECTED": (event: DashboardQueryRejected) => {
                setState({ status: "error", result: undefined });
                onError?.(event);
            },
        },
        (cmd) => {
            setState({
                status: "running",
                result: undefined,
            });
            onBeforeRun?.(cmd);
        },
    );

    return {
        run,
        ...state,
    };
};
