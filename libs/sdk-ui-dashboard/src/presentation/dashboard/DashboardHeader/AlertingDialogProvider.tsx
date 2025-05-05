// (C) 2022-2025 GoodData Corporation

import React from "react";

import { selectEnableAutomationFilterContext, useDashboardSelector } from "../../../model/index.js";
import { AlertingDialogProviderNew } from "./AlertingDialogProviderNew.js";
import { AlertingDialogProviderOld } from "./AlertingDialogProviderOld.js";

export const AlertingDialogProvider = () => {
    const enableAutomationFilters = useDashboardSelector(selectEnableAutomationFilterContext);

    if (enableAutomationFilters) {
        return <AlertingDialogProviderNew />;
    }

    return <AlertingDialogProviderOld />;
};
