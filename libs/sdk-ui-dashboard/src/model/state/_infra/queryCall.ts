// (C) 2021 GoodData Corporation

import { IDashboardQuery } from "../../queries";
import { queryEnvelopeWithPromise } from "./queryProcessing";
import { call, put } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";

/**
 * Runs the provided query and returns its result.
 *
 * @param q - query to run
 * @param refresh - indicates whether the query should ignore cached results and re-load data from backend
 */
export function* query<TResult>(q: IDashboardQuery<TResult>, refresh = false): SagaIterator<TResult> {
    const { promise, envelope } = queryEnvelopeWithPromise(q, refresh);
    const waitForResult = (): Promise<TResult> => {
        return promise;
    };

    /*
     * dispatch the enveloped query. the envelope is setup so that upon query finish a promise will be resolved
     */
    yield put(envelope);

    return yield call(waitForResult);
}

/**
 * Runs the provided query, forcing refresh of any results that may be cached in the state, and returns its result.
 *
 * @param q - query to run
 */
export function* queryFresh<TResult>(q: IDashboardQuery<TResult>): SagaIterator<TResult> {
    return yield call(query, q, true);
}
