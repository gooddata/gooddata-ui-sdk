// (C) 2021-2025 GoodData Corporation

import { type ReactElement } from "react";

import { ShareStatusIndicator } from "./ShareStatusIndicator.js";
import { type IShareStatusProps } from "./types.js";
import {
    selectCanManageAnalyticalDashboard,
    selectSupportsAccessControlCapability,
    useDashboardSelector,
} from "../../../../model/index.js";

/**
 * @alpha
 */
export function DefaultShareStatus(props: IShareStatusProps): ReactElement | null {
    const supportsAccessControl = useDashboardSelector(selectSupportsAccessControlCapability);
    const canManageAnalyticalDashboard = useDashboardSelector(selectCanManageAnalyticalDashboard);
    if (!supportsAccessControl || !canManageAnalyticalDashboard) {
        return null;
    }
    return <ShareStatusIndicator {...props} />;
}
