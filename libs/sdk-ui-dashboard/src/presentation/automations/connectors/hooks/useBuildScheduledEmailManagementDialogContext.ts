// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { DEFAULT_MAX_AUTOMATIONS } from "../../../../model/react/useDashboardAutomations/constants.js";
import {
    selectEnableAccessibilityMode,
    selectIsEmbedded,
} from "../../../../model/store/config/configSelectors.js";
import {
    selectEntitlementMaxAutomations,
    selectEntitlementUnlimitedAutomations,
} from "../../../../model/store/entitlements/entitlementsSelectors.js";
import { selectDashboardId, selectDashboardTitle } from "../../../../model/store/meta/metaSelectors.js";
import {
    selectAutomationsInvalidationId,
    selectIsScheduleEmailDialogOpen,
} from "../../../../model/store/ui/uiSelectors.js";
import type { IScheduledEmailManagementDialogContextValue } from "../../contexts/ScheduledEmailManagementDialogContext.js";

export function useBuildScheduledEmailManagementDialogContext(): IScheduledEmailManagementDialogContextValue {
    const isScheduleEmailDialogOpen = useDashboardSelector(selectIsScheduleEmailDialogOpen);
    const automationsInvalidationId = useDashboardSelector(selectAutomationsInvalidationId);
    const isEmbedded = useDashboardSelector(selectIsEmbedded);
    const enableAccessibilityMode = useDashboardSelector(selectEnableAccessibilityMode);
    const dashboardId = useDashboardSelector(selectDashboardId);
    const dashboardTitle = useDashboardSelector(selectDashboardTitle);

    const maxAutomationsEntitlement = useDashboardSelector(selectEntitlementMaxAutomations);
    const unlimitedAutomations = !!useDashboardSelector(selectEntitlementUnlimitedAutomations);
    const maxAutomations = parseInt(maxAutomationsEntitlement?.value ?? DEFAULT_MAX_AUTOMATIONS, 10);

    return useMemo(
        () => ({
            isScheduleEmailDialogOpen,
            automationsInvalidationId,
            isEmbedded,
            enableAccessibilityMode,
            dashboardId,
            dashboardTitle,
            maxAutomations,
            unlimitedAutomations,
        }),
        [
            isScheduleEmailDialogOpen,
            automationsInvalidationId,
            isEmbedded,
            enableAccessibilityMode,
            dashboardId,
            dashboardTitle,
            maxAutomations,
            unlimitedAutomations,
        ],
    );
}
