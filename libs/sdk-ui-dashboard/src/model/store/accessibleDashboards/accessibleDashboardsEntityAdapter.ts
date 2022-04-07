// (C) 2021-2022 GoodData Corporation
import { createEntityAdapter } from "@reduxjs/toolkit";
import { objRefToString } from "@gooddata/sdk-model";
import { IListedDashboard } from "@gooddata/sdk-model";

export const accessibleDashboardsEntityAdapter = createEntityAdapter<IListedDashboard>({
    selectId: (dashboard: IListedDashboard) => objRefToString(dashboard.ref),
});
