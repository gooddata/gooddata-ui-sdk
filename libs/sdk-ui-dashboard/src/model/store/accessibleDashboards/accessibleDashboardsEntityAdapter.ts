// (C) 2021 GoodData Corporation
import { createEntityAdapter } from "@reduxjs/toolkit";
import { objRefToString } from "@gooddata/sdk-model";
import { IListedDashboard } from "@gooddata/sdk-backend-spi";

export const accessibleDashboardsEntityAdapter = createEntityAdapter<IListedDashboard>({
    selectId: (dashboard: IListedDashboard) => objRefToString(dashboard.ref),
});
