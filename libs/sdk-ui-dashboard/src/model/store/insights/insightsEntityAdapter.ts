// (C) 2021-2025 GoodData Corporation
import { createEntityAdapter } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { IInsight, insightRef, serializeObjRef } from "@gooddata/sdk-model";

export const insightsAdapter = createEntityAdapter<IInsight>({
    selectId: (insight) => serializeObjRef(insightRef(insight)),
});
