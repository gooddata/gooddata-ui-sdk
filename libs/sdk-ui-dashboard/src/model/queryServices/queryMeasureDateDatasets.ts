// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, call, select } from "redux-saga/effects";

import {
    newBucket,
    newInsightDefinition,
    newMeasure,
    objRefToString,
    serializeObjRef,
} from "@gooddata/sdk-model";

import { loadDateDatasetsForInsight } from "./loadAvailableDateDatasets.js";
import {
    sanitizeDateDatasetTitle,
    sortByRelevanceAndTitle,
} from "../../_staging/catalog/dateDatasetOrdering.js";
import { invalidQueryArguments } from "../events/general.js";
import { type IMeasureDateDatasets, type IQueryMeasureDateDatasets } from "../queries/kpis.js";
import { type QueryCacheEntryResult, createCachedQueryService } from "../store/_infra/queryService.js";
import { selectAllCatalogMeasuresMap } from "../store/catalog/catalogSelectors.js";
import { type DashboardState } from "../store/types.js";
import { type DashboardContext } from "../types/commonTypes.js";

export const QueryDateDatasetsForMeasureService = createCachedQueryService(
    "GDC.DASH/QUERY.MEASURE.DATE.DATASETS",
    queryService,
    (query: IQueryMeasureDateDatasets) => serializeObjRef(query.payload.measureRef),
);

/**
 * Type of the selector that will return date datasets for a measure.
 * @internal
 */
export type selectDateDatasetsForMeasureType = (
    query: IQueryMeasureDateDatasets,
) => (state: DashboardState, ...params: any[]) => QueryCacheEntryResult<IMeasureDateDatasets> | undefined;

/**
 * Selector that will return date datasets for a measure. The input to the selector is the dashboard query that is used
 * to obtain and cache the data.
 *
 * This selector will return undefined if the query to obtain the data for a particular measure was not yet fired or
 * processed. Otherwise, will return object containing `status` of the data retrieval; if the `status` is
 * `'success'` then the `result` prop will contain the data.
 *
 * @remarks see {@link IQueryMeasureDateDatasets}
 * @internal
 */
export const selectDateDatasetsForMeasure: selectDateDatasetsForMeasureType =
    QueryDateDatasetsForMeasureService.cache.selectQueryResult;

//
// Query implementation
//

function* queryService(
    ctx: DashboardContext,
    query: IQueryMeasureDateDatasets,
): SagaIterator<IMeasureDateDatasets> {
    const {
        payload: { measureRef },
    } = query;

    const measures: ReturnType<typeof selectAllCatalogMeasuresMap> =
        yield select(selectAllCatalogMeasuresMap);
    const measure = measures.get(measureRef);

    if (!measure) {
        throw invalidQueryArguments(
            ctx,
            `Measure ${objRefToString(measureRef)} does not exist.`,
            query.correlationId,
        );
    }

    const intermediateInsight = newInsightDefinition("local:headline", (i) =>
        i.buckets([
            newBucket(
                "measures",
                newMeasure(measure.measure.ref, (m) => m.localId("measure_date_datasets_availability")),
            ),
        ]),
    );

    const dateDatasets: SagaReturnType<typeof loadDateDatasetsForInsight> = yield call(
        loadDateDatasetsForInsight,
        ctx,
        intermediateInsight,
    );

    const dateDatasetDisplayNames = Object.fromEntries(
        dateDatasets.map((d) => [d.dataSet.title, sanitizeDateDatasetTitle(d)]),
    );

    return {
        dateDatasets,
        dateDatasetsOrdered: sortByRelevanceAndTitle(dateDatasets, dateDatasetDisplayNames),
        dateDatasetDisplayNames,
    };
}
