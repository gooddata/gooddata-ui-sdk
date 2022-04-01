// (C) 2022 GoodData Corporation

import { ICatalogAttribute } from "@gooddata/sdk-backend-spi";
import { areObjRefsEqual, isObjRef, ObjRef, serializeObjRef } from "@gooddata/sdk-model";
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
        payload: { attributesOrRefs },
    } = query;

    const attributeRefs = attributesOrRefs.map((attributeOrRef) => {
        return isObjRef(attributeOrRef) ? attributeOrRef : attributeOrRef.attribute.displayForm;
    });

    const attributesLoaded: ReturnType<typeof selectCatalogAttributesLoaded> = yield select(
        selectCatalogAttributesLoaded,
    );

    if (attributesLoaded) {
        const attributes: ReturnType<typeof selectCatalogAttributes> = yield select(selectCatalogAttributes);

        return attributes.filter((attribute) => {
            return attributeRefs.some((ref) => areObjRefsEqual(ref, attribute.attribute.ref));
        });
    }

    return yield call(loadAttributes, context, attributeRefs);
}

export const QueryCatalogAttributesService = createCachedQueryService(
    "GDC.DASH/QUERY.CATALOG.ATTRIBUTES",
    queryService,
    (query: QueryCatalogAttributes) => {
        const {
            payload: { attributesOrRefs },
        } = query;

        const serializedRefs = attributesOrRefs.map((attributeOrRef) => {
            return isObjRef(attributeOrRef)
                ? serializeObjRef(attributeOrRef)
                : serializeObjRef(attributeOrRef.attribute.displayForm);
        });

        return serializedRefs.toLocaleString();
    },
);
