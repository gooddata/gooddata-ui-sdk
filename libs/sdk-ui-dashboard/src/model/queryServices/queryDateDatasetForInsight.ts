// (C) 2021 GoodData Corporation
import { DashboardContext } from "../types/commonTypes";
import { SagaIterator } from "redux-saga";
import { ObjRef, serializeObjRef } from "@gooddata/sdk-model";
import { call } from "redux-saga/effects";
import { createCachedQueryService } from "../state/_infra/queryService";
import { PromiseFnReturnType } from "../types/sagas";
import { DateDatasetsForInsight, QueryDateDatasetsForInsight } from "../queries";

export const QueryDateDatasetsForInsightService = createCachedQueryService(
    "GDC.DASH/QUERY.INSIGHT.DATE.DATASETS",
    dateDatasetsForInsightSaga,
    (query: QueryDateDatasetsForInsight) => serializeObjRef(query.payload.insightRef),
);

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
