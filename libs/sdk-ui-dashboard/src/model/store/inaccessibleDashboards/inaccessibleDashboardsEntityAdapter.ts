// (C) 2023 GoodData Corporation
import { createEntityAdapter } from "@reduxjs/toolkit";
import { objRefToString } from "@gooddata/sdk-model";
import { IInaccessibleDashboard } from "../../types/inaccessibleDashboardTypes.js";

export const inaccessibleDashboardsEntityAdapter = createEntityAdapter<IInaccessibleDashboard>({
    selectId: (dashboard: IInaccessibleDashboard) => objRefToString(dashboard.ref),
});
