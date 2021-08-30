// (C) 2020-2021 GoodData Corporation
import { useCallback, useState } from "react";
import { v4 as uuid } from "uuid";
import { GoodDataSdkError, UnexpectedSdkError } from "@gooddata/sdk-ui";

import {
    DashboardQueryFailed,
    DashboardQueryRejected,
    isDashboardQueryFailed,
    isDashboardQueryRejected,
} from "../events";
import { DashboardQueries, IDashboardQueryResult } from "../queries";

import { queryAndWaitFor } from "./queryAndWaitFor";
import { useDashboardDispatch } from "./DashboardStoreProvider";

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
>({
    queryCreator,
    onSuccess,
    onError,
    onRejected,
    onBeforeRun,
}: {
    queryCreator: (...args: TQueryCreatorArgs) => TQuery;
    onSuccess?: (result: IDashboardQueryResult<TQuery>) => void;
    onError?: (event: DashboardQueryFailed) => void;
    onRejected?: (event: DashboardQueryRejected) => void;
    onBeforeRun?: (query: TQuery) => void;
}): {
    run: (...args: TQueryCreatorArgs) => void;
    status?: QueryProcessingStatus;
    result?: IDashboardQueryResult<TQuery>;
    error?: GoodDataSdkError;
} => {
    const [state, setState] = useState<{
        result: IDashboardQueryResult<TQuery> | undefined;
        status: QueryProcessingStatus;
        error: GoodDataSdkError | undefined;
    }>();

    const dispatch = useDashboardDispatch();

    const run = useCallback(
        (...args: TQueryCreatorArgs) => {
            let query = queryCreator(...args);

            if (!query.correlationId) {
                query = {
                    ...query,
                    correlationId: uuid(),
                };
            }

            setState({
                status: "running",
                result: undefined,
                error: undefined,
            });
            onBeforeRun?.(query);

            queryAndWaitFor(dispatch, query)
                .then((result) => {
                    setState({ status: "success", result, error: undefined });
                    onSuccess?.(result);
                })
                .catch((e) => {
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
                });
        },
        [queryCreator, onSuccess, onError, onRejected, onBeforeRun],
    );

    return {
        run,
        ...state,
    };
};
