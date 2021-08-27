// (C) 2020-2021 GoodData Corporation
import { useCallback } from "react";
import { v4 as uuid } from "uuid";

import { DashboardQueries } from "../queries";
import { queryEnvelope } from "../state/_infra/queryProcessing";

import { useDashboardDispatch } from "./DashboardStoreProvider";

/**
 * Hook that takes query creator and event handlers and returns function
 * that will result into dispatching this query, registering the event handlers,
 * and unregistering them once event type with the same type and correlation ID is triggered.
 *
 * If no correlationId is provided, it's auto-generated.

 * @param queryCreator - query factory
 * @param eventHandlers - event handlers for the query
 * @param onBeforeRun - optionally provide callback that will be called before dispatching the query
 * @returns callback that dispatches the query, registers relevant event handlers and unregisters them
 *          when an event that matches the correlation ID and one of the specified event types occurs
 * @alpha
 */
export const useDashboardQuery = <TQuery extends DashboardQueries, TArgs extends any[]>(
    queryCreator: (...args: TArgs) => TQuery,
    eventHandlers?: {
        onStart?: (query: TQuery) => void;
        onSuccess?: (result: any) => void;
        onError?: (err: Error) => void;
    },
    onBeforeRun?: (command: TQuery) => void,
): ((...args: TArgs) => void) => {
    const dispatch = useDashboardDispatch();

    const run = useCallback((...args: TArgs) => {
        let query = queryCreator(...args);

        if (!query.correlationId) {
            query = {
                ...query,
                correlationId: uuid(),
            };
        }

        const envelopedQuery = queryEnvelope(query, eventHandlers);

        onBeforeRun?.(query);
        dispatch(envelopedQuery);
    }, []);

    return run;
};
