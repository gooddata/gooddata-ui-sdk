// (C) 2023-2025 GoodData Corporation
import { createEntityAdapter } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { objRefToString } from "@gooddata/sdk-model";
import { IInaccessibleDashboard } from "../../types/inaccessibleDashboardTypes.js";

export const inaccessibleDashboardsEntityAdapter = createEntityAdapter<IInaccessibleDashboard>({
    selectId: (dashboard: IInaccessibleDashboard) => objRefToString(dashboard.ref),
});
