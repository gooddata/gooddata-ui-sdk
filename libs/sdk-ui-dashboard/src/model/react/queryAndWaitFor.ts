// (C) 2021 GoodData Corporation

import { DashboardQueries, IDashboardQueryResult } from "../queries";
import { DashboardDispatch } from "../store/types";
import { queryEnvelopeWithPromise } from "../store/_infra/queryProcessing";

/**
 * Dispatches a query and returns a promise to its result.
 *
 * @param dispatch - dashboard dispatch to use
 * @param query - query to trigger and wait for results of
 * @returns Promise of the query result
 * @alpha
 */
export async function queryAndWaitFor<TQuery extends DashboardQueries>(
    dispatch: DashboardDispatch,
    query: TQuery,
): Promise<IDashboardQueryResult<TQuery>> {
    const { promise, envelope } = queryEnvelopeWithPromise(query);

    dispatch(envelope);

    return promise;
}
