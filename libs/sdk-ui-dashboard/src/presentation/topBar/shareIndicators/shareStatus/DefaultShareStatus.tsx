// (C) 2021-2022 GoodData Corporation
import React from "react";
import { IShareStatusProps } from "./types";
import {
    selectCanManageAnalyticalDashboard,
    selectSupportsAccessControlCapability,
    useDashboardSelector,
} from "../../../../model";
import { ShareStatusIndicator } from "./ShareStatusIndicator";

/**
 * @alpha
 */
export const DefaultShareStatus: React.FC<IShareStatusProps> = (props): JSX.Element | null => {
    const supportsAccessControl = useDashboardSelector(selectSupportsAccessControlCapability);
    const canManageAnalyticalDashboard = useDashboardSelector(selectCanManageAnalyticalDashboard);
    if (!supportsAccessControl || !canManageAnalyticalDashboard) {
        return null;
    }
    return <ShareStatusIndicator {...props} />;
};
