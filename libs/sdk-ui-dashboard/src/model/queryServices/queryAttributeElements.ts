// (C) 2022-2023 GoodData Corporation

import { ObjRef, serializeObjRef } from "@gooddata/sdk-model";
import { createCachedQueryService } from "../store/_infra/queryService.js";
import { DashboardContext } from "../types/commonTypes.js";
import { SagaIterator } from "redux-saga";
import { call, SagaReturnType } from "redux-saga/effects";
import { invalidQueryArguments } from "../events/general.js";
import { QueryAttributeElements } from "../queries/attributeElements.js";
import { IElementsQueryResult } from "@gooddata/sdk-backend-spi";
import { IUseAttributeElements } from "../types/attributeFilterTypes.js";

export const QueryAttributeElementsService = createCachedQueryService(
    "GDC.DASH/QUERY.ELEMENTS.ATTRIBUTE",
    queryService,
    (query: QueryAttributeElements) => {
        const {
            payload: { displayForm },
        } = query;

        return serializeObjRef(displayForm);
    },
);

async function loadAttributeElements(
    ctx: DashboardContext,
    displayFormRef: ObjRef,
    limit?: number,
): Promise<IElementsQueryResult> {
    const { backend, workspace } = ctx;
    let loader = backend.workspace(workspace).attributes().elements().forDisplayForm(displayFormRef);

    if (limit) {
        loader = loader.withLimit(limit);
    }

    return loader.query();
}

function* queryService(
    ctx: DashboardContext,
    query: QueryAttributeElements,
): SagaIterator<IUseAttributeElements> {
    const {
        payload: { displayForm, limit },
        correlationId,
    } = query;

    const attributeElements: SagaReturnType<typeof loadAttributeElements> = yield call(
        loadAttributeElements,
        ctx,
        displayForm,
        limit,
    );

    if (!attributeElements) {
        throw invalidQueryArguments(
            ctx,
            `Cannot find attribute elements for given displayForm`,
            correlationId,
        );
    }

    return {
        elements: attributeElements.items,
        totalCount: attributeElements.totalCount,
    };
}
