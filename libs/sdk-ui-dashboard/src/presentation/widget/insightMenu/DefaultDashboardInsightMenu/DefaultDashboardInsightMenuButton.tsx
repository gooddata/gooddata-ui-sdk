// (C) 2020 GoodData Corporation
import React from "react";

import { IDashboardInsightMenuButtonProps } from "../types.js";
import { DashboardInsightMenuButton } from "./DashboardInsightMenuButton.js";

/**
 * @internal
 */
export const DefaultDashboardInsightMenuButton = (props: IDashboardInsightMenuButtonProps): JSX.Element => {
    return <DashboardInsightMenuButton {...props} />;
};
