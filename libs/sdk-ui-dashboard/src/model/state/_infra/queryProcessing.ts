// (C) 2021 GoodData Corporation

import { IDashboardQueryService } from "./queryService";
import { Saga, SagaIterator } from "redux-saga";
import { actionChannel, call, getContext, spawn, take } from "redux-saga/effects";
import { IDashboardQuery } from "../../queries";
import { DashboardContext } from "../../types/commonTypes";
import keyBy from "lodash/keyBy";
import { Action, CombinedState, combineReducers, Reducer } from "@reduxjs/toolkit";
import fromPairs from "lodash/fromPairs";
import noop from "lodash/noop";

/**
 * Query processing component has multiple pieces that need to be integrated into the redux store.
 */
export type QueryProcessingComponents = {
    /**
     * Query services may store the results in state for caching purposes. All services that use caching implement
     * the cache as a separate slice of the internal `_queryCache` part of the state. This reducer is a combined
     * reducer including all the appropriate slice reducers.
     */
    queryCacheReducer: Reducer<CombinedState<any>>;

    /**
     * A single saga is in place to handle query processing requests. Query requests will be processes concurrently.
     */
    rootQueryProcessor: Saga;
};

export const QueryEnvelopeActionTypeName = "@@QUERY.ENVELOPE";

export type QueryEnvelope = {
    readonly type: typeof QueryEnvelopeActionTypeName;
    readonly query: IDashboardQuery;
    readonly onSuccess: (result: any) => void;
    readonly onError: (err: Error) => void;
};

function* processQuery(
    service: IDashboardQueryService<any, any>,
    ctx: DashboardContext,
    envelope: QueryEnvelope,
) {
    try {
        const result: SagaIterator<typeof service.generator> = yield call(
            service.generator,
            ctx,
            envelope.query,
        );

        envelope.onSuccess(result);
    } catch (e) {
        envelope.onError(e);
    }
}

function ensureQueryWrappedInEnvelope(action: Action): QueryEnvelope {
    if (action.type === QueryEnvelopeActionTypeName) {
        return action as QueryEnvelope;
    }

    return {
        type: QueryEnvelopeActionTypeName,
        query: action,
        onSuccess: noop,
        onError: noop,
    };
}

export function createQueryProcessingComponents(
    queryServices: IDashboardQueryService<any, any>[],
): QueryProcessingComponents {
    const servicesByType = keyBy(queryServices, (service) => service.name);
    const queryToReducers = fromPairs(
        queryServices.map((service) => [service.name, service.cache.slice.reducer]),
    );

    return {
        queryCacheReducer: combineReducers(queryToReducers),
        rootQueryProcessor: function* (): SagaIterator<void> {
            const queryChannel = yield actionChannel(
                (action: any) =>
                    action.type === QueryEnvelopeActionTypeName || action.type.startsWith("GDC.DASH/QUERY."),
            );

            while (true) {
                const envelope = ensureQueryWrappedInEnvelope(yield take(queryChannel));
                const dashboardContext: DashboardContext = yield getContext("dashboardContext");
                const service = servicesByType[envelope.query.type];

                yield spawn(processQuery, service, dashboardContext, envelope);
            }
        },
    };
}
