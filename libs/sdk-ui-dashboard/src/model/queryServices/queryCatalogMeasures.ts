// (C) 2022 GoodData Corporation

import { ICatalogMeasure } from "@gooddata/sdk-backend-spi";
import { areObjRefsEqual, ObjRef, serializeObjRef } from "@gooddata/sdk-model";
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
        payload: { refs },
    } = query;

    const measuresLoaded: ReturnType<typeof selectCatalogMeasuresLoaded> = yield select(
        selectCatalogMeasuresLoaded,
    );

    if (measuresLoaded) {
        const measures: ReturnType<typeof selectCatalogMeasures> = yield select(selectCatalogMeasures);

        return measures.filter((measure) => {
            return refs.some((ref) => areObjRefsEqual(ref, measure.measure.ref));
        });
    }

    return yield call(loadMeasures, context, refs);
}

export const QueryCatalogMeasuresService = createCachedQueryService(
    "GDC.DASH/QUERY.CATALOG.MEASURES",
    queryService,
    (query: QueryCatalogMeasures) => {
        const {
            payload: { refs },
        } = query;

        const serializedRefs = refs.map((ref) => serializeObjRef(ref));

        return serializedRefs.toLocaleString();
    },
);
