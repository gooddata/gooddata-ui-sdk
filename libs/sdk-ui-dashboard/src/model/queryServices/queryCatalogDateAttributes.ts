// (C) 2022 GoodData Corporation

import { ICatalogDateAttribute, ICatalogDateDataset } from "@gooddata/sdk-backend-spi";
import { areObjRefsEqual, ObjRef, serializeObjRef } from "@gooddata/sdk-model";
import { SagaIterator } from "redux-saga";
import { call, select } from "redux-saga/effects";
import { QueryCatalogDateDatasets } from "../queries/catalog";
import {
    selectCatalogDateDatasetsLoaded,
    selectCatalogDateDatasets,
} from "../store/catalog/catalogSelectors";
import { createCachedQueryService } from "../store/_infra/queryService";
import { DashboardContext } from "../types/commonTypes";

function filterByRefsAndObtain(dateDatasets: ICatalogDateDataset[], refs: ObjRef[]): ICatalogDateAttribute[] {
    return dateDatasets
        .filter((dataset) => {
            return dataset.dateAttributes.some((attr) =>
                refs.some((ref) => areObjRefsEqual(ref, attr.defaultDisplayForm.ref)),
            );
        })
        .flatMap((dataset) => dataset.dateAttributes);
}

async function loadDateDatasets(context: DashboardContext, refs: ObjRef[]): Promise<ICatalogDateAttribute[]> {
    const { backend, workspace } = context;

    const catalog = await backend
        .workspace(workspace)
        .catalog()
        .withOptions({
            types: ["dateDataset"],
        })
        .load();

    return filterByRefsAndObtain(catalog.dateDatasets(), refs);
}

function* queryService(
    context: DashboardContext,
    query: QueryCatalogDateDatasets,
): SagaIterator<ICatalogDateAttribute[]> {
    const {
        payload: { refs },
    } = query;

    const dateDatasetsLoaded: ReturnType<typeof selectCatalogDateDatasetsLoaded> = yield select(
        selectCatalogDateDatasetsLoaded,
    );

    if (dateDatasetsLoaded) {
        const dateDatasets: ReturnType<typeof selectCatalogDateDatasets> = yield select(
            selectCatalogDateDatasets,
        );

        return filterByRefsAndObtain(dateDatasets, refs);
    }

    return yield call(loadDateDatasets, context, refs);
}

export const QueryCatalogDateAttributesService = createCachedQueryService(
    "GDC.DASH/QUERY.CATALOG.DATE.ATTRIBUTES",
    queryService,
    (query: QueryCatalogDateDatasets) => {
        const {
            payload: { refs },
        } = query;

        const serializedRefs = refs.map((ref) => serializeObjRef(ref));

        return serializedRefs.toLocaleString();
    },
);
