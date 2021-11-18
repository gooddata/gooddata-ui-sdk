// (C) 2020 GoodData Corporation
import React from "react";

import { IDashboardInsightMenuButtonProps } from "../types";
import { DashboardInsightMenuButton } from "./DashboardInsightMenuButton";

/**
 * @internal
 */
export const DefaultDashboardInsightMenuButton = (props: IDashboardInsightMenuButtonProps): JSX.Element => {
    return <DashboardInsightMenuButton {...props} />;
};
