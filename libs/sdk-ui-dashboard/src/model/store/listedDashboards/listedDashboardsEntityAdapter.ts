// (C) 2021-2025 GoodData Corporation
import { createEntityAdapter, EntityId } from "@reduxjs/toolkit";
import { objRefToString, IListedDashboard } from "@gooddata/sdk-model";

export const listedDashboardsEntityAdapter = createEntityAdapter<IListedDashboard, EntityId>({
    selectId: (dashboard: IListedDashboard) => objRefToString(dashboard.ref),
});
