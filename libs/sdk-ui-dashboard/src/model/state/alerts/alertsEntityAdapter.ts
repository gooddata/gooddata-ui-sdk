// (C) 2021 GoodData Corporation
import { createEntityAdapter } from "@reduxjs/toolkit";
import { IWidgetAlert } from "@gooddata/sdk-backend-spi";
import { objRefToString } from "@gooddata/sdk-model";

export const alertsAdapter = createEntityAdapter<IWidgetAlert>({
    selectId: (alert) => objRefToString(alert.ref),
});
