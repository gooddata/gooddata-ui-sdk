// (C) 2021 GoodData Corporation
import { createEntityAdapter } from "@reduxjs/toolkit";
import { IInsight, insightRef, objRefToString } from "@gooddata/sdk-model";

export const insightsAdapter = createEntityAdapter<IInsight>({
    selectId: (insight) => objRefToString(insightRef(insight)),
});
