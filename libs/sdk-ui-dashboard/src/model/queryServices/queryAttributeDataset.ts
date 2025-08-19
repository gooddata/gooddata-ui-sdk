// (C) 2022-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { SagaReturnType, call, select } from "redux-saga/effects";

import { IAttributeWithReferences } from "@gooddata/sdk-backend-spi";
import { IMetadataObject, ObjRef, areObjRefsEqual, serializeObjRef } from "@gooddata/sdk-model";

import { invalidQueryArguments } from "../events/general.js";
import { QueryAttributeDataSet } from "../queries/attributeDataSet.js";
import { createCachedQueryService } from "../store/_infra/queryService.js";
import { selectPreloadedAttributesWithReferences } from "../store/index.js";
import { DashboardContext } from "../types/commonTypes.js";

export const QueryAttributeDataSetService = createCachedQueryService(
    "GDC.DASH/QUERY.DATA.SET.ATTRIBUTE",
    queryService,
    (query: QueryAttributeDataSet) => {
        const {
            payload: { displayForm },
        } = query;

        return serializeObjRef(displayForm);
    },
);

async function loadAttributeDataSetMeta(
    ctx: DashboardContext,
    attributeRef: ObjRef,
    preloadedAttributesWithReferences?: IAttributeWithReferences[],
): Promise<IMetadataObject> {
    const { backend, workspace } = ctx;

    // First try to get the dataSet from preloaded filters
    const dataSet = preloadedAttributesWithReferences?.find((attr) =>
        areObjRefsEqual(attr.attribute.ref, attributeRef),
    )?.dataSet;

    if (dataSet) {
        return dataSet;
    }

    // If dataSet is not in preloaded filters, fetch it from backend
    return backend.workspace(workspace).attributes().getAttributeDatasetMeta(attributeRef);
}

function* queryService(ctx: DashboardContext, query: QueryAttributeDataSet): SagaIterator<IMetadataObject> {
    const {
        payload: { displayForm },
        correlationId,
    } = query;

    const preloadedAttributesWithReferences: ReturnType<typeof selectPreloadedAttributesWithReferences> =
        yield select(selectPreloadedAttributesWithReferences);

    const attributeDataSet: SagaReturnType<typeof loadAttributeDataSetMeta> = yield call(
        loadAttributeDataSetMeta,
        ctx,
        displayForm,
        preloadedAttributesWithReferences,
    );

    if (!attributeDataSet) {
        throw invalidQueryArguments(
            ctx,
            `Cannot find attribute data set for given displayForm`,
            correlationId,
        );
    }

    return attributeDataSet;
}
