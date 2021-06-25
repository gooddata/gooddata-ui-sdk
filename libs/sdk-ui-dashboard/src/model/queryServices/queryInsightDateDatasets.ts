// (C) 2021 GoodData Corporation
import { DashboardContext } from "../types/commonTypes";
import { SagaIterator } from "redux-saga";
import { ObjRef, serializeObjRef } from "@gooddata/sdk-model";
import { call } from "redux-saga/effects";
import { createCachedQueryService } from "../state/_infra/queryService";
import { PromiseFnReturnType } from "../types/sagas";
import { InsightDateDatasets, QueryInsightDateDatasets } from "../queries";

export const QueryDateDatasetsForInsightService = createCachedQueryService(
    "GDC.DASH/QUERY.INSIGHT.DATE.DATASETS",
    dateDatasetsForInsightSaga,
    (query: QueryInsightDateDatasets) => serializeObjRef(query.payload.insightRef),
);

/**
 * Selector that will return date datasets for insight. The input to the selector is the dashboard query that is used
 * to obtain and cache the data.
 *
 * This selector will return undefined if the query to obtain the data for particular insight was not yet fired or
 * processed. Otherwise will return object containing `status` of the data retrieval; if the `status` is
 * `'success'` then the `result` prop will contain the data.
 *
 * @remarks see {@link QueryInsightDateDatasets}
 * @internal
 */
export const selectDateDatasetsForInsight = QueryDateDatasetsForInsightService.cache!.selectQueryResult;

//
// Query implementation
//

function loadDateDatasetsForInsight(
    _ctx: DashboardContext,
    _insightRef: ObjRef,
): Promise<InsightDateDatasets> {
    // this would normally do the necessary work
    return Promise.resolve({
        data: "some dummy data",
    });
}

function* dateDatasetsForInsightSaga(
    ctx: DashboardContext,
    query: QueryInsightDateDatasets,
): SagaIterator<InsightDateDatasets> {
    // this may do some more work then just a single call to async function...
    const result: PromiseFnReturnType<typeof loadDateDatasetsForInsight> = yield call(
        loadDateDatasetsForInsight,
        ctx,
        query.payload.insightRef,
    );

    return result;
}
