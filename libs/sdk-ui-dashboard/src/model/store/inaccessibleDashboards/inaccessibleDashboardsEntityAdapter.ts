// (C) 2023-2025 GoodData Corporation
import { type EntityId, createEntityAdapter } from "@reduxjs/toolkit";

import { objRefToString } from "@gooddata/sdk-model";

import { type IInaccessibleDashboard } from "../../types/inaccessibleDashboardTypes.js";

export const inaccessibleDashboardsEntityAdapter = createEntityAdapter<IInaccessibleDashboard, EntityId>({
    selectId: (dashboard: IInaccessibleDashboard) => objRefToString(dashboard.ref),
});
