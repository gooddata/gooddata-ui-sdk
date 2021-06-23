// (C) 2021 GoodData Corporation
import { DashboardContext } from "../types/commonTypes";
import { SagaIterator } from "redux-saga";
import { ObjRef, serializeObjRef } from "@gooddata/sdk-model";
import { call } from "redux-saga/effects";
import { createCachedQueryService } from "../state/_infra/queryService";
import { PromiseFnReturnType } from "../types/sagas";
import { IDashboardQuery } from "./base";

/**
 * Given a reference to an insight, this query will obtain list of all date datasets that may be used
 * to filter it.
 *
 * @internal
 */
export interface QueryDateDatasetsForInsight extends IDashboardQuery<DateDatasetsForInsight> {
    type: "GDC.DASH/QUERY.INSIGHT.DATE.DATASETS";
    payload: {
        insightRef: ObjRef;
    };
}

/**
 * Creates action through which you can query dashboard component for information about the date data sets
 * that are applicable for the provided insight.
 *
 * @param insightRef - reference to insight
 * @internal
 */
export function queryDateDatasetsForInsight(insightRef: ObjRef): QueryDateDatasetsForInsight {
    return {
        type: "GDC.DASH/QUERY.INSIGHT.DATE.DATASETS",
        payload: {
            insightRef,
        },
    };
}

/**
 * @internal
 */
export type DateDatasetsForInsight = {
    data: any;
};

export const QueryDateDatasetsForInsightService = createCachedQueryService({
    queryName: "GDC.DASH/QUERY.INSIGHT.DATE.DATASETS",
    generator: dateDatasetsForInsightSaga,
    queryToCacheKey: (query: QueryDateDatasetsForInsight) => serializeObjRef(query.payload.insightRef),
});

//
// Query implementation
//

function loadDateDatasetsForInsight(
    _ctx: DashboardContext,
    _insightRef: ObjRef,
): Promise<DateDatasetsForInsight> {
    // this would normally do the necessary work
    return Promise.resolve({
        data: "some dummy data",
    });
}

function* dateDatasetsForInsightSaga(
    ctx: DashboardContext,
    query: QueryDateDatasetsForInsight,
): SagaIterator<DateDatasetsForInsight> {
    // this may do some more work then just a single call to async function...
    const result: PromiseFnReturnType<typeof loadDateDatasetsForInsight> = yield call(
        loadDateDatasetsForInsight,
        ctx,
        query.payload.insightRef,
    );

    return result;
}
