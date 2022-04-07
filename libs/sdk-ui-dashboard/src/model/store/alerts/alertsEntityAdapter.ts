// (C) 2021-2022 GoodData Corporation
import { createEntityAdapter } from "@reduxjs/toolkit";
import { objRefToString, IWidgetAlert } from "@gooddata/sdk-model";

export const alertsAdapter = createEntityAdapter<IWidgetAlert>({
    selectId: (alert) => objRefToString(alert.ref),
});
