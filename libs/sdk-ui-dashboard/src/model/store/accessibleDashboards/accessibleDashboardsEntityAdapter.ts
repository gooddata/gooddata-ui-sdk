// (C) 2021-2025 GoodData Corporation
import { type EntityId, createEntityAdapter } from "@reduxjs/toolkit";

import { type IListedDashboard, objRefToString } from "@gooddata/sdk-model";

export const accessibleDashboardsEntityAdapter = createEntityAdapter<IListedDashboard, EntityId>({
    selectId: (dashboard: IListedDashboard) => objRefToString(dashboard.ref),
});
