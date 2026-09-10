// (C) 2022-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, call } from "redux-saga/effects";

import { type ObjRef, serializeObjRef } from "@gooddata/sdk-model";

import { isComputedAttributesUnavailableError } from "../../_staging/catalog/computedAttributes.js";
import { type IQueryConnectedAttributes } from "../queries/connectedAttributes.js";
import { createCachedQueryService } from "../store/_infra/queryService.js";
import { type DashboardContext } from "../types/commonTypes.js";

export const QueryConnectedAttributesService = createCachedQueryService(
    "GDC.DASH/QUERY.CONNECTED.ATTRIBUTES",
    queryService,
    (query: IQueryConnectedAttributes) => {
        const {
            payload: { ref, includeComputedAttributes },
        } = query;

        // the flag is part of the cache identity: the same ref yields a different result with and
        // without computed attributes (the ?? false mirrors the query creator's default, for
        // queries constructed without the creator)
        return `${serializeObjRef(ref)}:${includeComputedAttributes ?? false}`;
    },
);

async function loadConnectedAttributes(
    ctx: DashboardContext,
    ref: ObjRef,
    includeComputedAttributes: boolean,
): Promise<ObjRef[]> {
    const { backend, workspace } = ctx;
    const attributes = backend.workspace(workspace).attributes();

    try {
        return await attributes.getConnectedAttributesByDisplayForm(ref, { includeComputedAttributes });
    } catch (error) {
        // when the backend refuses computed attributes (enableComputedAttributes off), fall back
        // to plain attributes; a genuine failure propagates
        if (!includeComputedAttributes || !isComputedAttributesUnavailableError(error)) {
            throw error;
        }
        return attributes.getConnectedAttributesByDisplayForm(ref, { includeComputedAttributes: false });
    }
}

function* queryService(ctx: DashboardContext, query: IQueryConnectedAttributes): SagaIterator<ObjRef[]> {
    const {
        payload: { ref },
    } = query;

    const connectedAttributes: SagaReturnType<typeof loadConnectedAttributes> = yield call(
        loadConnectedAttributes,
        ctx,
        ref,
        query.payload.includeComputedAttributes ?? false,
    );

    return connectedAttributes;
}
