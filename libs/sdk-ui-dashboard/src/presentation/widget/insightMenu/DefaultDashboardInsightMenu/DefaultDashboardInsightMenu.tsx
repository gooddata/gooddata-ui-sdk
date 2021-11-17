// (C) 2020 GoodData Corporation
import React from "react";

import { IDashboardInsightMenuProps } from "../types";
import { DashboardInsightMenu } from "./DashboardInsightMenu";

/**
 * @alpha
 */
export const DefaultDashboardInsightMenu = (props: IDashboardInsightMenuProps): JSX.Element => {
    return <DashboardInsightMenu {...props} />;
};
