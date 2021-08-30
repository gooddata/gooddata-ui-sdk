// (C) 2021 GoodData Corporation

import { IDashboardQuery } from "../../queries";
import { queryEnvelopeWithPromise } from "./queryProcessing";
import { call, put } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";

/**
 * Runs the provided query and returns its result.
 *
 * @param q - query to run
 */
export function* query<TResult>(q: IDashboardQuery<TResult>): SagaIterator<TResult> {
    const { promise, envelope } = queryEnvelopeWithPromise(q);
    const waitForResult = (): Promise<TResult> => {
        return promise;
    };

    /*
     * dispatch the enveloped query. the envelope is setup so that upon query finish a promise will be resolved
     */
    yield put(envelope);

    return yield call(waitForResult);
}
