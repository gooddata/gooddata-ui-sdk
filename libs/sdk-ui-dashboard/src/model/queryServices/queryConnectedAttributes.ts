// (C) 2022-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { SagaReturnType, call } from "redux-saga/effects";

import { ObjRef, serializeObjRef } from "@gooddata/sdk-model";

import { QueryConnectedAttributes } from "../queries/connectedAttributes.js";
import { createCachedQueryService } from "../store/_infra/queryService.js";
import { DashboardContext } from "../types/commonTypes.js";

export const QueryConnectedAttributesService = createCachedQueryService(
    "GDC.DASH/QUERY.CONNECTED.ATTRIBUTES",
    queryService,
    (query: QueryConnectedAttributes) => {
        const {
            payload: { ref },
        } = query;

        return serializeObjRef(ref);
    },
);

async function loadConnectedAttributes(ctx: DashboardContext, ref: ObjRef): Promise<ObjRef[]> {
    const { backend, workspace } = ctx;

    return await backend.workspace(workspace).attributes().getConnectedAttributesByDisplayForm(ref);
}

function* queryService(ctx: DashboardContext, query: QueryConnectedAttributes): SagaIterator<ObjRef[]> {
    const {
        payload: { ref },
    } = query;

    const connectedAttributes: SagaReturnType<typeof loadConnectedAttributes> = yield call(
        loadConnectedAttributes,
        ctx,
        ref,
    );

    return connectedAttributes;
}
