// (C) 2022-2025 GoodData Corporation

import React from "react";

import { AlertingDialogProviderNew } from "./AlertingDialogProviderNew.js";
import { AlertingDialogProviderOld } from "./AlertingDialogProviderOld.js";
import { selectEnableAutomationFilterContext, useDashboardSelector } from "../../../model/index.js";

export function AlertingDialogProvider() {
    const enableAutomationFilters = useDashboardSelector(selectEnableAutomationFilterContext);

    if (enableAutomationFilters) {
        return <AlertingDialogProviderNew />;
    }

    return <AlertingDialogProviderOld />;
}
