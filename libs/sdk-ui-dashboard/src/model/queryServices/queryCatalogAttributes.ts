// (C) 2022 GoodData Corporation

import { ICatalogAttribute } from "@gooddata/sdk-backend-spi";
import { areObjRefsEqual, ObjRef, serializeObjRef } from "@gooddata/sdk-model";
import { SagaIterator } from "redux-saga";
import { call, select } from "redux-saga/effects";
import { QueryCatalogAttributes } from "../queries/catalog";
import { selectCatalogAttributesLoaded, selectCatalogAttributes } from "../store/catalog/catalogSelectors";
import { createCachedQueryService } from "../store/_infra/queryService";
import { DashboardContext } from "../types/commonTypes";

async function loadAttributes(
    context: DashboardContext,
    attributeRefs: ObjRef[],
): Promise<ICatalogAttribute[]> {
    const { backend, workspace } = context;

    const attributes = await backend.workspace(workspace).attributes().getCatalogAttributes(attributeRefs);

    return attributes.filter((attribute) => attribute.attribute.production);
}

function* queryService(
    context: DashboardContext,
    query: QueryCatalogAttributes,
): SagaIterator<ICatalogAttribute[]> {
    const {
        payload: { refs },
    } = query;

    const attributesLoaded: ReturnType<typeof selectCatalogAttributesLoaded> = yield select(
        selectCatalogAttributesLoaded,
    );

    if (attributesLoaded) {
        const attributes: ReturnType<typeof selectCatalogAttributes> = yield select(selectCatalogAttributes);

        return attributes.filter((attribute) => {
            return refs.some((ref) => areObjRefsEqual(ref, attribute.attribute.ref));
        });
    }

    return yield call(loadAttributes, context, refs);
}

export const QueryCatalogAttributesService = createCachedQueryService(
    "GDC.DASH/QUERY.CATALOG.ATTRIBUTES",
    queryService,
    (query: QueryCatalogAttributes) => {
        const {
            payload: { refs },
        } = query;

        const serializedRefs = refs.map((ref) => serializeObjRef(ref));

        return serializedRefs.toLocaleString();
    },
);
