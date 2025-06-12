// (C) 2021-2025 GoodData Corporation
import { createEntityAdapter } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { objRefToString, IListedDashboard } from "@gooddata/sdk-model";

export const accessibleDashboardsEntityAdapter = createEntityAdapter<IListedDashboard>({
    selectId: (dashboard: IListedDashboard) => objRefToString(dashboard.ref),
});
