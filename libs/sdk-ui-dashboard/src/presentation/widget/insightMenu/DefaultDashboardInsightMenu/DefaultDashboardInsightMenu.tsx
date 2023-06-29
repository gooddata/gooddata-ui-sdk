// (C) 2020 GoodData Corporation
import React from "react";

import { IDashboardInsightMenuProps } from "../types.js";
import { DashboardInsightMenu } from "./DashboardInsightMenu/index.js";

/**
 * @alpha
 */
export const DefaultDashboardInsightMenu = (props: IDashboardInsightMenuProps): JSX.Element => {
    return <DashboardInsightMenu {...props} />;
};
