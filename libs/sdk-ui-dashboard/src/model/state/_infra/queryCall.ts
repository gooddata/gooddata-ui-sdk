// (C) 2021 GoodData Corporation

import { IDashboardQuery } from "../../queries";
import noop from "lodash/noop";
import { QueryEnvelope, QueryEnvelopeActionTypeName } from "./queryProcessing";
import { call, put } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";

function envelopeWithPromise<TResult>(q: IDashboardQuery<TResult>): {
    promise: Promise<TResult>;
    envelope: QueryEnvelope;
} {
    const partialEnvelope = {
        onStart: noop,
        onSuccess: noop,
        onError: noop,
    };

    const promise = new Promise<TResult>((resolve, reject) => {
        partialEnvelope.onSuccess = resolve;
        partialEnvelope.onError = reject;
    });

    const envelope: QueryEnvelope = {
        type: QueryEnvelopeActionTypeName,
        query: q,
        ...partialEnvelope,
    };

    return {
        promise,
        envelope,
    };
}

/**
 * Runs the provided query and returns its result.
 *
 * @param q - query to run
 */
export function* query<TResult>(q: IDashboardQuery<TResult>): SagaIterator<TResult> {
    const { promise, envelope } = envelopeWithPromise(q);
    const waitForResult = (): Promise<TResult> => {
        return promise;
    };

    /*
     * dispatch the enveloped query. the envelope is setup so that upon query finish a promise will be resolved
     */
    yield put(envelope);

    return yield call(waitForResult);
}
