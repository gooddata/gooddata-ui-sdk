// (C) 2021-2025 GoodData Corporation
import React, { ReactElement } from "react";
import { IShareStatusProps } from "./types.js";
import {
    selectCanManageAnalyticalDashboard,
    selectEnableAnalyticalDashboardPermissions,
    selectSupportsAccessControlCapability,
    useDashboardSelector,
} from "../../../../model/index.js";
import { ShareStatusIndicator } from "./ShareStatusIndicator.js";

/**
 * @alpha
 */
export const DefaultShareStatus: React.FC<IShareStatusProps> = (props): ReactElement | null => {
    const arePermissionsEnabled = useDashboardSelector(selectEnableAnalyticalDashboardPermissions);
    const supportsAccessControl = useDashboardSelector(selectSupportsAccessControlCapability);
    const canManageAnalyticalDashboard = useDashboardSelector(selectCanManageAnalyticalDashboard);
    if (!arePermissionsEnabled || !supportsAccessControl || !canManageAnalyticalDashboard) {
        return null;
    }
    return <ShareStatusIndicator {...props} />;
};
