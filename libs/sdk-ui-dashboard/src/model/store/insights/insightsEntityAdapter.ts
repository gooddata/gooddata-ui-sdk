// (C) 2021-2025 GoodData Corporation
import { createEntityAdapter, EntityId } from "@reduxjs/toolkit";
import { IInsight, insightRef, serializeObjRef } from "@gooddata/sdk-model";

export const insightsAdapter = createEntityAdapter<IInsight, EntityId>({
    selectId: (insight) => serializeObjRef(insightRef(insight)),
});
