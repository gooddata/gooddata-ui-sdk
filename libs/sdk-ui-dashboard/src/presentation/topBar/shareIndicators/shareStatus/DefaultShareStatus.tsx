// (C) 2021-2022 GoodData Corporation
import React from "react";
import { IShareStatusProps } from "./types";
import { selectCanManageAnalyticalDashboard, useDashboardSelector } from "../../../../model";
import { ShareStatusIndicator } from "./ShareStatusIndicator";
import { selectSupportsAccessControlCapability } from "../../../../model/store/backendCapabilities/backendCapabilitiesSelectors";
import { selectEnableAnalyticalDashboardPermissions } from "../../../../model/store/config/configSelectors";

/**
 * @alpha
 */
export const DefaultShareStatus: React.FC<IShareStatusProps> = (props): JSX.Element | null => {
    const arePermissionsEnabled = useDashboardSelector(selectEnableAnalyticalDashboardPermissions);
    const supportsAccessControl = useDashboardSelector(selectSupportsAccessControlCapability);
    const canManageAnalyticalDashboard = useDashboardSelector(selectCanManageAnalyticalDashboard);
    if (!arePermissionsEnabled || !supportsAccessControl || !canManageAnalyticalDashboard) {
        return null;
    }
    return <ShareStatusIndicator {...props} />;
};
