// (C) 2021 GoodData Corporation

import { DashboardQueries } from "../../queries/index.js";
import { DashboardDispatch } from "../types.js";
import { queryEnvelopeWithPromise } from "./queryProcessing.js";

/**
 * Dispatches a query and returns a promise to its result.
 *
 * @param dispatch - dashboard dispatch to use
 * @param query - query to trigger and wait for results of
 * @returns Promise of the query result
 * @alpha
 */
export async function queryAndWaitFor<TQuery extends DashboardQueries, TQueryResult>(
    dispatch: DashboardDispatch,
    query: TQuery,
): Promise<TQueryResult> {
    const { promise, envelope } = queryEnvelopeWithPromise<TQuery, TQueryResult>(query);

    dispatch(envelope);

    return promise;
}
