// (C) 2020-2025 GoodData Corporation
import React, { ReactElement } from "react";

import { DashboardInsightMenuButton } from "./DashboardInsightMenuButton.js";
import { IDashboardInsightMenuButtonProps } from "../types.js";

/**
 * @internal
 */
export const DefaultDashboardInsightMenuButton = (props: IDashboardInsightMenuButtonProps): ReactElement => {
    return <DashboardInsightMenuButton {...props} />;
};
