// (C) 2021 GoodData Corporation
import React from "react";

import { ILockedStatusProps } from "./types";
import { selectSettings, useDashboardSelector } from "../../../../model";
import { LockedStatusIndicator } from "./LockedStatusIndicator";

/**
 * @alpha
 */
export const DefaultLockedStatus = (props: ILockedStatusProps): JSX.Element | null => {
    const settings = useDashboardSelector(selectSettings);
    if (!settings.enableAnalyticalDashboardPermissions) {
        return null;
    }
    return <LockedStatusIndicator {...props} />;
};
