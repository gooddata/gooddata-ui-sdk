// (C) 2020-2025 GoodData Corporation
import React, { ReactElement } from "react";

import { IDashboardInsightMenuButtonProps } from "../types.js";
import { DashboardInsightMenuButton } from "./DashboardInsightMenuButton.js";

/**
 * @internal
 */
export const DefaultDashboardInsightMenuButton = (props: IDashboardInsightMenuButtonProps): ReactElement => {
    return <DashboardInsightMenuButton {...props} />;
};
