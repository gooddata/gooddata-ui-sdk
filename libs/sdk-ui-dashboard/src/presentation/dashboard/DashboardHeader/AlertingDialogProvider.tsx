// (C) 2022-2025 GoodData Corporation

import { selectEnableAutomationFilterContext, useDashboardSelector } from "../../../model/index.js";
import { AlertingDialogProviderNew } from "./AlertingDialogProviderNew.js";
import { AlertingDialogProviderOld } from "./AlertingDialogProviderOld.js";

export function AlertingDialogProvider() {
    const enableAutomationFilters = useDashboardSelector(selectEnableAutomationFilterContext);

    if (enableAutomationFilters) {
        return <AlertingDialogProviderNew />;
    }

    return <AlertingDialogProviderOld />;
}
