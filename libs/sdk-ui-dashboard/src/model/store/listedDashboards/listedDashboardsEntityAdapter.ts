// (C) 2021-2025 GoodData Corporation
import { EntityId, createEntityAdapter } from "@reduxjs/toolkit";

import { IListedDashboard, objRefToString } from "@gooddata/sdk-model";

export const listedDashboardsEntityAdapter = createEntityAdapter<IListedDashboard, EntityId>({
    selectId: (dashboard: IListedDashboard) => objRefToString(dashboard.ref),
});
