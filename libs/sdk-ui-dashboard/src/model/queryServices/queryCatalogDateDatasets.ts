// (C) 2022 GoodData Corporation

import { ICatalogDateDataset } from "@gooddata/sdk-backend-spi";
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

async function loadDateDatasets(context: DashboardContext, refs: ObjRef[]): Promise<ICatalogDateDataset[]> {
    const { backend, workspace } = context;

    const catalog = await backend
        .workspace(workspace)
        .catalog()
        .withOptions({
            types: ["dateDataset"],
        })
        .load();

    const dateDatasets = catalog.dateDatasets();
    return dateDatasets.filter((dataset) => {
        return dataset.dateAttributes.some((attr) =>
            refs.some((ref) => areObjRefsEqual(ref, attr.defaultDisplayForm.ref)),
        );
    });
}

function* queryService(
    context: DashboardContext,
    query: QueryCatalogDateDatasets,
): SagaIterator<ICatalogDateDataset[]> {
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

        return dateDatasets.filter((dataset) => {
            return dataset.dateAttributes.some((attr) =>
                refs.some((ref) => areObjRefsEqual(ref, attr.defaultDisplayForm.ref)),
            );
        });
    }

    return yield call(loadDateDatasets, context, refs);
}

export const QueryCatalogAttributesService = createCachedQueryService(
    "GDC.DASH/QUERY.CATALOG.ATTRIBUTES",
    queryService,
    (query: QueryCatalogDateDatasets) => {
        const {
            payload: { refs },
        } = query;

        const serializedRefs = refs.map((ref) => serializeObjRef(ref));

        return serializedRefs.toLocaleString();
    },
);
