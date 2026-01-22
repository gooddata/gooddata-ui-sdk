// (C) 2022-2026 GoodData Corporation

import { AlertingDialogProviderNew } from "./AlertingDialogProviderNew.js";
import { AlertingDialogProviderOld } from "./AlertingDialogProviderOld.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectEnableAutomationFilterContext } from "../../../model/store/config/configSelectors.js";

export function AlertingDialogProvider() {
    const enableAutomationFilters = useDashboardSelector(selectEnableAutomationFilterContext);

    if (enableAutomationFilters) {
        return <AlertingDialogProviderNew />;
    }

    return <AlertingDialogProviderOld />;
}
