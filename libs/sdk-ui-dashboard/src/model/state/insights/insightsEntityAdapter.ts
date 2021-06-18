// (C) 2021 GoodData Corporation
import { createEntityAdapter } from "@reduxjs/toolkit";
import { IInsight, insightRef, serializeObjRef } from "@gooddata/sdk-model";

export const insightsAdapter = createEntityAdapter<IInsight>({
    selectId: (insight) => serializeObjRef(insightRef(insight)),
});
