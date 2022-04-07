// (C) 2022 GoodData Corporation

import { areObjRefsEqual, ObjRef, serializeObjRef, ICatalogMeasure } from "@gooddata/sdk-model";
import { SagaIterator } from "redux-saga";
import { call, select } from "redux-saga/effects";
import { QueryCatalogMeasures } from "../queries/catalog";
import { createCachedQueryService } from "../store/_infra/queryService";
import { DashboardContext } from "../types/commonTypes";
import { selectCatalogMeasures, selectCatalogMeasuresLoaded } from "../store/catalog/catalogSelectors";

async function loadMeasures(context: DashboardContext, measureRefs: ObjRef[]): Promise<ICatalogMeasure[]> {
    const { backend, workspace } = context;

    const measures = await backend.workspace(workspace).measures().getCatalogMeasures(measureRefs);

    return measures.filter((measure) => measure.measure.production);
}

function* queryService(
    context: DashboardContext,
    query: QueryCatalogMeasures,
): SagaIterator<ICatalogMeasure[]> {
    const {
        payload: { measureRefs },
    } = query;

    const measuresLoaded: ReturnType<typeof selectCatalogMeasuresLoaded> = yield select(
        selectCatalogMeasuresLoaded,
    );

    if (measuresLoaded) {
        const measures: ReturnType<typeof selectCatalogMeasures> = yield select(selectCatalogMeasures);

        return measures.filter((measure) => {
            return measureRefs.some((ref) => areObjRefsEqual(ref, measure.measure.ref));
        });
    }

    return yield call(loadMeasures, context, measureRefs);
}

export const QueryCatalogMeasuresService = createCachedQueryService(
    "GDC.DASH/QUERY.CATALOG.MEASURES",
    queryService,
    (query: QueryCatalogMeasures) => {
        const {
            payload: { measureRefs },
        } = query;

        const serializedRefs = measureRefs.map((ref) => serializeObjRef(ref));

        return serializedRefs.toLocaleString();
    },
);
