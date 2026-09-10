// (C) 2022-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, call, select } from "redux-saga/effects";

import { type IAttributeWithReferences } from "@gooddata/sdk-backend-spi";
import {
    type IMetadataObject,
    type ObjRef,
    areObjRefsEqual,
    isComputedAttributeRef,
    serializeObjRef,
} from "@gooddata/sdk-model";

import { invalidQueryArguments } from "../events/general.js";
import { type IQueryAttributeDataSet } from "../queries/attributeDataSet.js";
import { createCachedQueryService } from "../store/_infra/queryService.js";
import { selectPreloadedAttributesWithReferences } from "../store/tabs/filterContext/filterContextSelectors.js";
import { type DashboardContext } from "../types/commonTypes.js";

export const QueryAttributeDataSetService = createCachedQueryService(
    "GDC.DASH/QUERY.DATA.SET.ATTRIBUTE",
    queryService,
    (query: IQueryAttributeDataSet) => {
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
): Promise<IMetadataObject | undefined> {
    const { backend, workspace } = ctx;

    // First try to get the dataSet from preloaded filters
    const dataSet = preloadedAttributesWithReferences?.find((attr) =>
        areObjRefsEqual(attr.attribute.ref, attributeRef),
    )?.dataSet;

    if (dataSet) {
        return dataSet;
    }

    // A computed attribute never matches a label; take the dataset from its own metadata (if any)
    if (isComputedAttributeRef(attributeRef)) {
        const computedAttribute = await backend
            .workspace(workspace)
            .computedAttributes()
            .getComputedAttribute(attributeRef);

        return computedAttribute.dataSet;
    }

    // If dataSet is not in preloaded filters, fetch it from backend
    return backend.workspace(workspace).attributes().getAttributeDatasetMeta(attributeRef);
}

function* queryService(ctx: DashboardContext, query: IQueryAttributeDataSet): SagaIterator<IMetadataObject> {
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
