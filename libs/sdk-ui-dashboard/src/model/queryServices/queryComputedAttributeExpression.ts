// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, call } from "redux-saga/effects";

import { type IMeasureExpressionToken } from "@gooddata/sdk-backend-spi";
import { type ObjRef, serializeObjRef } from "@gooddata/sdk-model";

import { type IQueryComputedAttributeExpression } from "../queries/computedAttributeExpression.js";
import { createCachedQueryService } from "../store/_infra/queryService.js";
import { type DashboardContext } from "../types/commonTypes.js";

export const QueryComputedAttributeExpressionService = createCachedQueryService(
    "GDC.DASH/QUERY.COMPUTED.ATTRIBUTE.EXPRESSION",
    queryService,
    (query: IQueryComputedAttributeExpression) => {
        const {
            payload: { ref },
        } = query;

        return serializeObjRef(ref);
    },
);

async function loadComputedAttributeExpressionTokens(
    ctx: DashboardContext,
    ref: ObjRef,
): Promise<IMeasureExpressionToken[]> {
    const { backend, workspace } = ctx;

    return backend.workspace(workspace).computedAttributes().getComputedAttributeExpressionTokens(ref);
}

function* queryService(
    ctx: DashboardContext,
    query: IQueryComputedAttributeExpression,
): SagaIterator<IMeasureExpressionToken[]> {
    const {
        payload: { ref },
    } = query;

    const tokens: SagaReturnType<typeof loadComputedAttributeExpressionTokens> = yield call(
        loadComputedAttributeExpressionTokens,
        ctx,
        ref,
    );

    return tokens;
}
