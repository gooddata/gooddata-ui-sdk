// (C) 2021-2026 GoodData Corporation

import { type ReactElement } from "react";

import { LockedStatusIndicator } from "./LockedStatusIndicator.js";
import { type ILockedStatusProps } from "./types.js";
import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { selectSettings } from "../../../../model/store/config/configSelectors.js";
import { selectCanManageAnalyticalDashboard } from "../../../../model/store/permissions/permissionsSelectors.js";

/**
 * @alpha
 */

export function DefaultLockedStatus(props: ILockedStatusProps): ReactElement | null {
    const settings = useDashboardSelector(selectSettings);
    const canManageAnalyticalDashboard = useDashboardSelector(selectCanManageAnalyticalDashboard);
    if (!settings["enableNewAnalyticalDashboardsNavigation"] || !canManageAnalyticalDashboard) {
        return null;
    }
    return <LockedStatusIndicator {...props} />;
}
