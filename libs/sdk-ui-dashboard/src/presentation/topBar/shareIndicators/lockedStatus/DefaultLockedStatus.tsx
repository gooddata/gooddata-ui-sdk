// (C) 2021-2025 GoodData Corporation

import { ILockedStatusProps } from "./types.js";
import {
    selectCanManageAnalyticalDashboard,
    selectSettings,
    useDashboardSelector,
} from "../../../../model/index.js";
import { LockedStatusIndicator } from "./LockedStatusIndicator.js";

/**
 * @alpha
 */

export function DefaultLockedStatus(props: ILockedStatusProps) {
    const settings = useDashboardSelector(selectSettings);
    const canManageAnalyticalDashboard = useDashboardSelector(selectCanManageAnalyticalDashboard);
    if (!settings.enableNewAnalyticalDashboardsNavigation || !canManageAnalyticalDashboard) {
        return null;
    }
    return <LockedStatusIndicator {...props} />;
}
