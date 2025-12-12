// (C) 2021-2025 GoodData Corporation
import { type EntityId, createEntityAdapter } from "@reduxjs/toolkit";

import { type IInsight, insightRef, serializeObjRef } from "@gooddata/sdk-model";

export const insightsAdapter = createEntityAdapter<IInsight, EntityId>({
    selectId: (insight) => serializeObjRef(insightRef(insight)),
});
