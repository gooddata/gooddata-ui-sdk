// (C) 2021 GoodData Corporation
import React from "react";
import { IShareStatusProps } from "./types";
import { selectSettings, useDashboardSelector } from "../../../../model";
import { ShareStatusIndicator } from "./ShareStatusIndicator";

/**
 * @alpha
 */
export const DefaultShareStatus = (props: IShareStatusProps): JSX.Element | null => {
    const settings = useDashboardSelector(selectSettings);
    if (!settings.enableAnalyticalDashboardPermissions) {
        return null;
    }
    return <ShareStatusIndicator {...props} />;
};
