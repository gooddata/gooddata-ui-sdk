// (C) 2021-2025 GoodData Corporation

import { type Action, type Reducer, combineReducers } from "@reduxjs/toolkit";
import { compact, keyBy } from "lodash-es";
import { type Saga, type SagaIterator } from "redux-saga";
import { actionChannel, call, spawn, take } from "redux-saga/effects";

import { getDashboardContext } from "./contexts.js";
import { dispatchDashboardEvent } from "./eventDispatcher.js";
import { type IDashboardQueryService } from "./queryService.js";
import {
    internalQueryErrorOccurred,
    isDashboardQueryFailed,
    queryCompleted,
    queryRejected,
    queryStarted,
} from "../../events/general.js";
import { type IDashboardQuery } from "../../queries/index.js";
import { type DashboardContext } from "../../types/commonTypes.js";

/**
 * Query processing component has multiple pieces that need to be integrated into the redux store.
 */
export interface QueryProcessingModule {
    /**
     * Query services may store the results in state for caching purposes. All services that use caching implement
     * the cache as a separate slice of the internal `_queryCache` part of the state. This reducer is a combined
     * reducer including all the appropriate slice reducers.
     */
    queryCacheReducer: Reducer<any>;

    /**
     * A single saga is in place to handle query processing requests. Query requests will be processed concurrently.
     */
    rootQueryProcessor: Saga;
}

/**
 * @internal
 */
export const QueryEnvelopeActionPrefix = "__Q";

type QueryEnvelopeEventHandlers<TQuery extends IDashboardQuery, TQueryResult> = {
    onStart: (query: TQuery) => void;
    onSuccess: (result: TQueryResult) => void;
    onError: (err: Error) => void;
};

type QueryEnvelope<TQuery extends IDashboardQuery, TQueryResult> = Readonly<
    QueryEnvelopeEventHandlers<TQuery, TQueryResult>
> & {
    readonly type: string;
    readonly query: IDashboardQuery;
    readonly refresh?: boolean;
};

function isQueryEnvelope(obj: unknown): obj is QueryEnvelope<any, any> {
    return !!obj && (obj as QueryEnvelope<any, any>).type.startsWith(QueryEnvelopeActionPrefix);
}

/**
 * @internal
 */
export function queryEnvelope<TQuery extends IDashboardQuery, TQueryResult>(
    query: TQuery,
    eventHandlers?: Partial<QueryEnvelopeEventHandlers<TQuery, TQueryResult>>,
    refresh: boolean = false,
): QueryEnvelope<TQuery, TQueryResult> {
    return {
        type: `${QueryEnvelopeActionPrefix}(${query.type})`,
        query,
        refresh,
        onError: eventHandlers?.onError ?? (() => {}),
        onStart: eventHandlers?.onStart ?? (() => {}),
        onSuccess: eventHandlers?.onSuccess ?? (() => {}),
    };
}

/**
 * @internal
 */
export function queryEnvelopeWithPromise<TQuery extends IDashboardQuery, TQueryResult>(
    query: TQuery,
    refresh: boolean = false,
): {
    promise: Promise<TQueryResult>;
    envelope: QueryEnvelope<TQuery, TQueryResult>;
} {
    const queryEnvelopeEventHandlers: Partial<QueryEnvelopeEventHandlers<TQuery, TQueryResult>> = {};

    const promise = new Promise<TQueryResult>((resolve, reject) => {
        queryEnvelopeEventHandlers.onSuccess = resolve;
        queryEnvelopeEventHandlers.onError = reject;
    });

    const envelope = queryEnvelope(query, queryEnvelopeEventHandlers, refresh);

    return {
        promise,
        envelope,
    };
}

function* processQuery(
    service: IDashboardQueryService<any, any>,
    ctx: DashboardContext,
    envelope: QueryEnvelope<any, any>,
) {
    const {
        query,
        query: { type, correlationId },
    } = envelope;
    const correlationIdForLog = correlationId ?? "(no correlationId provided)";

    try {
        try {
            envelope.onStart(query);
        } catch (e) {
            console.warn(
                `An error has occurred while calling onStart function provided for ${type}@${correlationIdForLog} processing:`,
                e,
            );
        }

        yield dispatchDashboardEvent(queryStarted(ctx, query, correlationId));

        const result: SagaIterator<typeof service.generator> = yield call(
            service.generator,
            ctx,
            envelope.query,
            envelope.refresh ?? false,
        );

        try {
            envelope.onSuccess(result);
        } catch (e) {
            console.warn(
                `An error has occurred while calling onSuccess function provided for ${type}@${correlationIdForLog} processing`,
                e,
            );
        }
        yield dispatchDashboardEvent(queryCompleted(ctx, query, result, correlationId));
    } catch (e: any) {
        try {
            envelope.onError(e);
        } catch (ne) {
            console.warn(
                `An error has occurred while calling onError function provided for ${type}@${correlationIdForLog} processing:`,
                ne,
            );
        }

        if (isDashboardQueryFailed(e)) {
            yield dispatchDashboardEvent(e);
        } else {
            yield dispatchDashboardEvent(
                internalQueryErrorOccurred(
                    ctx,
                    `An internal error has occurred while processing ${type}`,
                    e,
                    correlationId,
                ),
            );
        }
    }
}

function ensureQueryWrappedInEnvelope(action: Action): QueryEnvelope<any, any> {
    return isQueryEnvelope(action) ? action : queryEnvelope(action as IDashboardQuery);
}

/**
 * Creates components that should be integrated into the dashboard store in order to facilitate query processing.
 *
 * @param queryServices - query services use to initialize the components
 */
export function createQueryProcessingModule(
    queryServices: IDashboardQueryService<any, any>[],
): QueryProcessingModule {
    const servicesByType = keyBy(queryServices, (service) => service.name);
    const queryToReducers = Object.fromEntries(
        compact(
            queryServices.map((service) => {
                if (!service.cache) {
                    return null;
                }

                return [service.cache.cacheName, service.cache.reducer];
            }),
        ),
    );

    return {
        queryCacheReducer: combineReducers(queryToReducers),
        /*
         * The root saga for all query processing. This will channel in all query envelopes and all non-enveloped
         * queries and will dispatch the query
         */
        rootQueryProcessor: function* (): SagaIterator<void> {
            const queryChannel = yield actionChannel(
                (action: any) =>
                    action.type &&
                    (action.type.startsWith(QueryEnvelopeActionPrefix) ||
                        action.type.startsWith("GDC.DASH/QUERY.")),
            );

            while (true) {
                const query = yield take(queryChannel);
                const envelope = ensureQueryWrappedInEnvelope(query);
                const dashboardContext: DashboardContext = yield call(getDashboardContext);
                const service = servicesByType[envelope.query.type];

                if (service) {
                    yield spawn(processQuery, service, dashboardContext, envelope);
                } else {
                    yield dispatchDashboardEvent(
                        queryRejected(dashboardContext, envelope.query.correlationId),
                    );
                }
            }
        },
    };
}
