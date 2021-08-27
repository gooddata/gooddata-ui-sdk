// (C) 2020-2021 GoodData Corporation
import { useState } from "react";
import { GoodDataSdkError, UnexpectedSdkError } from "@gooddata/sdk-ui";

import {
    DashboardQueryFailed,
    DashboardQueryRejected,
    isDashboardQueryFailed,
    isDashboardQueryRejected,
} from "../events";
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
    onSuccess?: (result: TResult) => void;
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
            onError: (e) => {
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
            },
            onSuccess: (result: TResult) => {
                setState({ status: "success", result: result, error: undefined });
                onSuccess?.(result);
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
