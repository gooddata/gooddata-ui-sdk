// (C) 2022-2023 GoodData Corporation

import { IMetadataObject, ObjRef, serializeObjRef } from "@gooddata/sdk-model";
import { createCachedQueryService } from "../store/_infra/queryService.js";
import { DashboardContext } from "../types/commonTypes.js";
import { SagaIterator } from "redux-saga";
import { call, SagaReturnType } from "redux-saga/effects";
import { invalidQueryArguments } from "../events/general.js";
import { QueryAttributeDataSet } from "../queries/attributeDataSet.js";

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
    displayFormRef: ObjRef,
): Promise<IMetadataObject> {
    const { backend, workspace } = ctx;
    return backend.workspace(workspace).attributes().getAttributeDatasetMeta(displayFormRef);
}

function* queryService(ctx: DashboardContext, query: QueryAttributeDataSet): SagaIterator<IMetadataObject> {
    const {
        payload: { displayForm },
        correlationId,
    } = query;

    const attributeDataSet: SagaReturnType<typeof loadAttributeDataSetMeta> = yield call(
        loadAttributeDataSetMeta,
        ctx,
        displayForm,
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
